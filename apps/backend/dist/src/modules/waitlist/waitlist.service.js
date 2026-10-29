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
exports.WaitlistService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const realtime_gateway_1 = require("../../realtime/realtime.gateway");
let WaitlistService = class WaitlistService {
    prisma;
    realtime;
    constructor(prisma, realtime) {
        this.prisma = prisma;
        this.realtime = realtime;
    }
    listWaiting(branchId) {
        return this.prisma.waitlistEntry.findMany({
            where: { branchId, status: 'WAITING' },
            orderBy: { createdAt: 'asc' },
        });
    }
    async create(branchId, dto) {
        const created = await this.prisma.waitlistEntry.create({
            data: { ...dto, branchId },
        });
        this.realtime.emitToBranch(branchId, 'waitlist.created', {
            id: created.id,
        });
        return created;
    }
    async seat(branchId, id, tableId) {
        const entry = await this.prisma.waitlistEntry.findFirst({
            where: { id, branchId },
        });
        if (!entry)
            throw new common_1.NotFoundException('Waitlist entry not found');
        if (entry.status !== 'WAITING') {
            throw new common_1.BadRequestException('Entry is not waiting');
        }
        const table = await this.prisma.table.findFirst({
            where: { id: tableId, floor: { branchId } },
            select: { id: true },
        });
        if (!table) {
            throw new common_1.BadRequestException('Table is invalid for this branch');
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const result = await tx.waitlistEntry.update({
                where: { id },
                data: { status: 'SEATED', tableId, seatedAt: new Date() },
            });
            await tx.table.update({
                where: { id: tableId },
                data: { status: 'OCCUPIED', statusSince: new Date() },
            });
            return result;
        });
        this.realtime.emitToBranch(branchId, 'waitlist.updated', {
            id: updated.id,
        });
        this.realtime.emitToBranch(branchId, 'table.updated', { id: tableId });
        return updated;
    }
    async cancel(branchId, id) {
        const entry = await this.prisma.waitlistEntry.findFirst({
            where: { id, branchId },
        });
        if (!entry)
            throw new common_1.NotFoundException('Waitlist entry not found');
        const updated = await this.prisma.waitlistEntry.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });
        this.realtime.emitToBranch(branchId, 'waitlist.updated', {
            id: updated.id,
        });
        return updated;
    }
};
exports.WaitlistService = WaitlistService;
exports.WaitlistService = WaitlistService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        realtime_gateway_1.RealtimeGateway])
], WaitlistService);
//# sourceMappingURL=waitlist.service.js.map