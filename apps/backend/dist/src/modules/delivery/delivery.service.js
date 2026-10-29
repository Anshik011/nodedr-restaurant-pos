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
exports.DeliveryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const realtime_gateway_1 = require("../../realtime/realtime.gateway");
const webhooks_service_1 = require("../webhooks/webhooks.service");
const NEXT = {
    UNASSIGNED: ['ASSIGNED', 'FAILED'],
    ASSIGNED: ['PICKED_UP', 'UNASSIGNED', 'FAILED'],
    PICKED_UP: ['DELIVERED', 'FAILED'],
    DELIVERED: [],
    FAILED: ['UNASSIGNED'],
};
const ORDER_INCLUDE = {
    driver: { select: { id: true, name: true } },
    deliveryZone: { select: { id: true, name: true } },
};
let DeliveryService = class DeliveryService {
    prisma;
    realtime;
    webhooks;
    constructor(prisma, realtime, webhooks) {
        this.prisma = prisma;
        this.realtime = realtime;
        this.webhooks = webhooks;
    }
    listZones(branchId) {
        return this.prisma.deliveryZone.findMany({
            where: { branchId },
            orderBy: { name: 'asc' },
        });
    }
    async createZone(branchId, dto) {
        await this.assertPincodesFree(branchId, dto.pincodes);
        return this.prisma.deliveryZone.create({ data: { ...dto, branchId } });
    }
    async updateZone(branchId, id, dto) {
        await this.getZone(branchId, id);
        if (dto.pincodes)
            await this.assertPincodesFree(branchId, dto.pincodes, id);
        return this.prisma.deliveryZone.update({ where: { id }, data: dto });
    }
    async deleteZone(branchId, id) {
        await this.getZone(branchId, id);
        await this.prisma.deliveryZone.delete({ where: { id } });
        return { ok: true };
    }
    async getZone(branchId, id) {
        const zone = await this.prisma.deliveryZone.findFirst({
            where: { id, branchId },
        });
        if (!zone)
            throw new common_1.NotFoundException('Delivery zone not found');
        return zone;
    }
    async assertPincodesFree(branchId, pincodes, exceptId) {
        const clash = await this.prisma.deliveryZone.findFirst({
            where: {
                branchId,
                isActive: true,
                pincodes: { hasSome: pincodes },
                ...(exceptId ? { id: { not: exceptId } } : {}),
            },
            select: { name: true },
        });
        if (clash)
            throw new common_1.BadRequestException(`A pincode is already covered by the zone "${clash.name}"`);
    }
    async quote(branchId, pincode) {
        const zone = await this.prisma.deliveryZone.findFirst({
            where: { branchId, isActive: true, pincodes: { has: pincode } },
        });
        if (!zone)
            return { deliverable: false };
        return {
            deliverable: true,
            zoneName: zone.name,
            fee: Number(zone.fee),
            minOrderAmount: Number(zone.minOrderAmount),
            etaMinutes: zone.etaMinutes,
        };
    }
    list(branchId, history = false) {
        return this.prisma.order.findMany({
            where: {
                branchId,
                type: 'DELIVERY',
                status: { not: 'CANCELLED' },
                deliveryStatus: history
                    ? { in: ['DELIVERED', 'FAILED'] }
                    : { in: ['UNASSIGNED', 'ASSIGNED', 'PICKED_UP'] },
            },
            include: ORDER_INCLUDE,
            orderBy: { createdAt: history ? 'desc' : 'asc' },
            take: 200,
        });
    }
    listDrivers(branchId) {
        return this.prisma.user.findMany({
            where: {
                isActive: true,
                branches: { some: { branchId } },
                role: { name: 'DELIVERY_STAFF' },
            },
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
        });
    }
    async assignDriver(branchId, orderId, driverId) {
        const order = await this.getDelivery(branchId, orderId);
        if (!['UNASSIGNED', 'ASSIGNED'].includes(order.deliveryStatus ?? ''))
            throw new common_1.BadRequestException('This delivery can no longer be reassigned');
        const driver = await this.prisma.user.findFirst({
            where: { id: driverId, isActive: true, branches: { some: { branchId } } },
            select: { id: true },
        });
        if (!driver)
            throw new common_1.BadRequestException('Driver not found for this branch');
        return this.save(branchId, orderId, {
            driverId,
            deliveryStatus: 'ASSIGNED',
        });
    }
    async setStatus(branchId, orderId, status) {
        const order = await this.getDelivery(branchId, orderId);
        const current = order.deliveryStatus ?? 'UNASSIGNED';
        if (!NEXT[current].includes(status))
            throw new common_1.BadRequestException(`Cannot move from ${current} to ${status}`);
        if (status === 'PICKED_UP' && !order.driverId)
            throw new common_1.BadRequestException('Assign a driver first');
        return this.save(branchId, orderId, {
            deliveryStatus: status,
            ...(status === 'UNASSIGNED' ? { driverId: null } : {}),
            ...(status === 'DELIVERED' ? { deliveredAt: new Date() } : {}),
        });
    }
    async getDelivery(branchId, orderId) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, branchId, type: 'DELIVERY' },
        });
        if (!order)
            throw new common_1.NotFoundException('Delivery order not found');
        return order;
    }
    async save(branchId, orderId, data) {
        const updated = await this.prisma.order.update({
            where: { id: orderId },
            data,
            include: ORDER_INCLUDE,
        });
        this.realtime.emitToBranch(branchId, 'order.updated', { id: orderId });
        void this.webhooks.emitForBranch(branchId, 'delivery.updated', {
            orderId,
            orderNumber: updated.orderNumber,
            status: updated.deliveryStatus,
            driver: updated.driver?.name ?? null,
            address: updated.deliveryAddress,
        });
        return updated;
    }
};
exports.DeliveryService = DeliveryService;
exports.DeliveryService = DeliveryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        realtime_gateway_1.RealtimeGateway,
        webhooks_service_1.WebhooksService])
], DeliveryService);
//# sourceMappingURL=delivery.service.js.map