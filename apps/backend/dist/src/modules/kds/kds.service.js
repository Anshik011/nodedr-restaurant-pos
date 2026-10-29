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
exports.KdsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const kot_print_service_1 = require("../orders/kot-print.service");
const orders_service_1 = require("../orders/orders.service");
let KdsService = class KdsService {
    prisma;
    ordersService;
    kotPrint;
    constructor(prisma, ordersService, kotPrint) {
        this.prisma = prisma;
        this.ordersService = ordersService;
        this.kotPrint = kotPrint;
    }
    listStations(branchId) {
        return this.prisma.kitchenStation.findMany({
            where: { branchId },
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
        });
    }
    async listActiveTickets(branchId, stationId) {
        return this.prisma.kot.findMany({
            where: {
                order: { branchId },
                status: { notIn: ['SERVED', 'CANCELLED', 'REJECTED'] },
                ...(stationId ? { OR: [{ stationId }, { stationId: null }] } : {}),
            },
            include: {
                station: true,
                order: {
                    select: {
                        orderNumber: true,
                        type: true,
                        table: true,
                        guestName: true,
                        notes: true,
                        channel: true,
                        customer: { select: { name: true, phone: true } },
                    },
                },
                items: { include: { orderItem: { include: { modifiers: true } } } },
            },
            orderBy: { createdAt: 'asc' },
        });
    }
    listIncoming(branchId) {
        return this.prisma.order.findMany({
            where: { branchId, status: 'OPEN', acceptance: 'PENDING' },
            select: {
                id: true,
                orderNumber: true,
                type: true,
                channel: true,
                guestName: true,
                notes: true,
                createdAt: true,
                scheduledFor: true,
                table: { select: { number: true, name: true } },
                customer: { select: { name: true, phone: true } },
                items: {
                    select: {
                        id: true,
                        nameSnapshot: true,
                        quantity: true,
                        kitchenNote: true,
                        modifiers: { select: { nameSnapshot: true } },
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
    }
    async progress(branchId) {
        const kots = await this.prisma.kot.findMany({
            where: {
                order: { branchId, status: 'OPEN' },
                status: { notIn: ['CANCELLED', 'REJECTED'] },
            },
            select: {
                id: true,
                orderId: true,
                status: true,
                createdAt: true,
                readyAt: true,
                order: {
                    select: {
                        orderNumber: true,
                        type: true,
                        table: { select: { id: true, number: true, name: true } },
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
        return kots;
    }
    updateStatus(branchId, kotId, status, userId) {
        return this.ordersService.updateKotStatus(branchId, kotId, status, userId);
    }
    rejectTicket(branchId, kotId, userId, input) {
        return this.ordersService.rejectKot(branchId, kotId, userId, input);
    }
    acceptIncoming(branchId, orderId, userId) {
        return this.ordersService.acceptOrder(branchId, orderId, userId);
    }
    declineIncoming(branchId, orderId, userId, reason) {
        return this.ordersService.rejectOrder(branchId, orderId, userId, reason);
    }
    print(branchId, kotId, reprint) {
        return this.kotPrint.printTicket(branchId, kotId, reprint);
    }
    setPriority(branchId, kotId, isPriority) {
        return this.ordersService.setKotPriority(branchId, kotId, isPriority);
    }
    async getPerformanceReport(branchId, date) {
        const start = date ? new Date(date) : new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        const kots = await this.prisma.kot.findMany({
            where: {
                order: { branchId },
                createdAt: { gte: start, lt: end },
                readyAt: { not: null },
            },
            select: {
                stationId: true,
                createdAt: true,
                readyAt: true,
                station: { select: { name: true } },
            },
        });
        const byStation = new Map();
        for (const kot of kots) {
            const key = kot.stationId ?? 'unassigned';
            const name = kot.station?.name ?? 'Unassigned';
            const minutes = (kot.readyAt.getTime() - kot.createdAt.getTime()) / 60_000;
            const bucket = byStation.get(key) ?? { name, totalMinutes: 0, count: 0 };
            bucket.totalMinutes += minutes;
            bucket.count += 1;
            byStation.set(key, bucket);
        }
        return Array.from(byStation.entries()).map(([stationId, bucket]) => ({
            stationId,
            stationName: bucket.name,
            ticketsReady: bucket.count,
            avgMinutesToReady: Math.round((bucket.totalMinutes / bucket.count) * 10) / 10,
        }));
    }
};
exports.KdsService = KdsService;
exports.KdsService = KdsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        orders_service_1.OrdersService,
        kot_print_service_1.KotPrintService])
], KdsService);
//# sourceMappingURL=kds.service.js.map