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
var ReservationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationsService = void 0;
const common_1 = require("@nestjs/common");
const notifications_service_1 = require("../../notifications/notifications.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const realtime_gateway_1 = require("../../realtime/realtime.gateway");
const webhooks_service_1 = require("../webhooks/webhooks.service");
let ReservationsService = ReservationsService_1 = class ReservationsService {
    prisma;
    realtime;
    notifications;
    webhooks;
    logger = new common_1.Logger(ReservationsService_1.name);
    constructor(prisma, realtime, notifications, webhooks) {
        this.prisma = prisma;
        this.realtime = realtime;
        this.notifications = notifications;
        this.webhooks = webhooks;
    }
    list(branchId, date) {
        const where = { branchId };
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setDate(end.getDate() + 1);
            where.reservedAt = { gte: start, lt: end };
        }
        return this.prisma.reservation.findMany({
            where,
            include: { table: { select: { id: true, number: true, name: true } } },
            orderBy: { reservedAt: 'asc' },
        });
    }
    async create(branchId, dto, options = {}) {
        if (dto.tableId) {
            const table = await this.prisma.table.findFirst({
                where: { id: dto.tableId, floor: { branchId } },
                select: { id: true },
            });
            if (!table) {
                throw new common_1.BadRequestException('Table is invalid for this branch');
            }
        }
        if (options.fromWebsite) {
            await this.assertWithinOnlineBookingCapacity(branchId, dto.guestCount);
        }
        const autoConfirm = options.fromWebsite
            ? (await this.prisma.branch.findUnique({
                where: { id: branchId },
                select: { autoConfirmReservations: true },
            }))?.autoConfirmReservations
            : false;
        const created = await this.prisma.$transaction(async (tx) => {
            const reservation = await tx.reservation.create({
                data: {
                    ...dto,
                    branchId,
                    ...(options.fromWebsite ? { channel: 'ONLINE' } : {}),
                    ...(autoConfirm ? { status: 'CONFIRMED' } : {}),
                },
            });
            if (reservation.tableId) {
                await tx.table.update({
                    where: { id: reservation.tableId },
                    data: { status: 'RESERVED', statusSince: new Date() },
                });
            }
            return reservation;
        });
        this.realtime.emitToBranch(branchId, 'reservation.created', {
            id: created.id,
        });
        if (created.tableId) {
            this.realtime.emitToBranch(branchId, 'table.updated', {
                id: created.tableId,
            });
        }
        try {
            await this.notifications.notifyByPermission(branchId, 'reservations.manage', {
                type: 'reservation.new',
                title: options.fromWebsite
                    ? 'New online reservation'
                    : 'New reservation',
                body: `${created.customerName} — party of ${created.guestCount}, ${new Date(created.reservedAt).toLocaleString()}`,
                entity: 'Reservation',
                entityId: created.id,
            });
        }
        catch (err) {
            this.logger.warn(`Failed to send reservation.new notification for reservation ${created.id}: ${err instanceof Error ? err.message : String(err)}`);
        }
        void this.webhooks.emitForBranch(branchId, 'reservation.created', {
            reservationId: created.id,
            customerName: created.customerName,
            phone: created.phone,
            guestCount: created.guestCount,
            reservedAt: created.reservedAt,
            channel: created.channel,
        });
        return created;
    }
    async assertWithinOnlineBookingCapacity(branchId, guestCount) {
        const tables = await this.prisma.table.findMany({
            where: { floor: { branchId } },
            select: { capacity: true },
            orderBy: { capacity: 'desc' },
            take: 2,
        });
        if (tables.length === 0)
            return;
        const maxOnlineGuests = tables.reduce((sum, t) => sum + t.capacity, 0);
        if (guestCount > maxOnlineGuests) {
            throw new common_1.BadRequestException(`Online booking is limited to ${maxOnlineGuests} guests (about 2 tables). For a larger party, please call the restaurant directly to reserve.`);
        }
    }
    async updateStatus(branchId, id, status) {
        const reservation = await this.prisma.reservation.findFirst({
            where: { id, branchId },
        });
        if (!reservation)
            throw new common_1.NotFoundException('Reservation not found');
        const updated = await this.prisma.$transaction(async (tx) => {
            const result = await tx.reservation.update({
                where: { id },
                data: { status },
            });
            if (result.tableId) {
                if (status === 'ARRIVED') {
                    await tx.table.update({
                        where: { id: result.tableId },
                        data: { status: 'OCCUPIED', statusSince: new Date() },
                    });
                }
                else if (status === 'COMPLETED' ||
                    status === 'CANCELLED' ||
                    status === 'NO_SHOW') {
                    await tx.table.update({
                        where: { id: result.tableId },
                        data: { status: 'AVAILABLE', statusSince: new Date() },
                    });
                }
            }
            return result;
        });
        this.realtime.emitToBranch(branchId, 'reservation.updated', {
            id: updated.id,
            status,
        });
        if (updated.tableId) {
            this.realtime.emitToBranch(branchId, 'table.updated', {
                id: updated.tableId,
            });
        }
        return updated;
    }
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = ReservationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        realtime_gateway_1.RealtimeGateway,
        notifications_service_1.NotificationsService,
        webhooks_service_1.WebhooksService])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map