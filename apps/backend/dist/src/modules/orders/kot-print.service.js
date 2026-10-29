"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KotPrintService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const realtime_gateway_1 = require("../../realtime/realtime.gateway");
const escpos_receipt_1 = require("./escpos-receipt");
const escpos_usb_1 = require("./escpos-usb");
const printer_transport_1 = require("./printer-transport");
let KotPrintService = class KotPrintService {
    prisma;
    realtime;
    constructor(prisma, realtime) {
        this.prisma = prisma;
        this.realtime = realtime;
    }
    load(branchId, where) {
        return this.prisma.kot.findMany({
            where: {
                ...where,
                order: { branchId },
                status: { not: 'CANCELLED' },
            },
            include: {
                station: true,
                order: {
                    include: {
                        table: true,
                        customer: true,
                        branch: true,
                    },
                },
                items: {
                    where: { status: { not: 'CANCELLED' } },
                    include: { orderItem: { include: { modifiers: true } } },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
    }
    async printTicket(branchId, kotId, reprint) {
        const kots = await this.load(branchId, { id: kotId });
        if (kots.length === 0)
            throw new common_1.NotFoundException('KOT not found');
        return this.run(branchId, kots, reprint);
    }
    async printOrder(branchId, orderId, reprint) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, branchId },
            select: { id: true },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const kots = await this.load(branchId, { orderId });
        if (kots.length === 0) {
            throw new common_1.ConflictException({
                code: 'NO_TICKETS',
                message: 'This order has no kitchen tickets to print',
            });
        }
        return this.run(branchId, kots, reprint);
    }
    async run(branchId, kots, reprint) {
        const todo = reprint ? kots : kots.filter((k) => k.printedCount === 0);
        if (todo.length === 0) {
            throw new common_1.ConflictException({
                code: 'ALREADY_PRINTED',
                message: 'This ticket was already printed. Choose Reprint if you really need another copy.',
            });
        }
        const result = {
            ok: true,
            printed: [],
            unsupportedChars: [],
        };
        for (const kot of todo) {
            if (!reprint) {
                const claimed = await this.prisma.kot.updateMany({
                    where: { id: kot.id, printedCount: 0 },
                    data: { printedCount: 1, printedAt: new Date() },
                });
                if (claimed.count === 0)
                    continue;
            }
            const branch = kot.order.branch;
            const copy = reprint ? kot.printedCount : 0;
            const job = (0, escpos_receipt_1.buildKotEscPosJob)({
                branchName: branch.name,
                profile: (0, escpos_receipt_1.resolveProfile)({
                    paperWidthMm: branch.printerPaperWidthMm,
                    codepage: branch.printerCodepage,
                    columns: branch.printerColumns,
                }),
                ticket: {
                    number: kot.ticketNumber,
                    station: kot.station?.name ?? null,
                    reprint: copy,
                },
                order: {
                    orderNumber: kot.order.orderNumber,
                    type: kot.order.type,
                    createdAt: kot.order.createdAt,
                    table: kot.order.table
                        ? {
                            label: kot.order.table.name ?? `#${kot.order.table.number}`,
                        }
                        : null,
                    customer: kot.order.customer
                        ? { name: kot.order.customer.name ?? 'Guest' }
                        : kot.order.guestName
                            ? { name: kot.order.guestName }
                            : null,
                    notes: kot.order.notes,
                    items: kot.items.map(({ orderItem }) => ({
                        nameSnapshot: orderItem.nameSnapshot,
                        quantity: orderItem.quantity,
                        kitchenNote: orderItem.kitchenNote,
                        modifiers: orderItem.modifiers.map((m) => ({
                            nameSnapshot: m.nameSnapshot,
                        })),
                    })),
                },
            });
            try {
                await (0, printer_transport_1.sendToBranchPrinter)(branch, job.buffer);
            }
            catch (err) {
                const message = err instanceof Error ? err.message : 'Printing failed';
                await this.prisma.kot.update({
                    where: { id: kot.id },
                    data: {
                        lastPrintError: message.slice(0, 300),
                        ...(reprint ? {} : { printedCount: 0, printedAt: null }),
                    },
                });
                if (err instanceof escpos_usb_1.PrinterNotFoundError) {
                    throw new common_1.ServiceUnavailableException(err.message);
                }
                throw new common_1.ServiceUnavailableException(`Kitchen printer error: ${message}`);
            }
            const updated = await this.prisma.kot.update({
                where: { id: kot.id },
                data: {
                    lastPrintError: null,
                    ...(reprint
                        ? { printedCount: { increment: 1 }, printedAt: new Date() }
                        : {}),
                },
            });
            result.printed.push({
                id: kot.id,
                ticketNumber: kot.ticketNumber,
                reprint: copy,
            });
            result.unsupportedChars.push(...job.unsupportedChars);
            this.realtime.emitToBranch(branchId, 'kot.reprinted', {
                id: updated.id,
                printedCount: updated.printedCount,
            });
        }
        if (result.printed.length === 0) {
            throw new common_1.ConflictException({
                code: 'ALREADY_PRINTED',
                message: 'These tickets were just printed by another request.',
            });
        }
        result.unsupportedChars = [...new Set(result.unsupportedChars)];
        return result;
    }
};
exports.KotPrintService = KotPrintService;
exports.KotPrintService = KotPrintService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        realtime_gateway_1.RealtimeGateway])
], KotPrintService);
//# sourceMappingURL=kot-print.service.js.map