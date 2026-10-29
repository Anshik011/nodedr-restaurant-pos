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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const realtime_gateway_1 = require("../realtime/realtime.gateway");
let NotificationsService = class NotificationsService {
    prisma;
    realtime;
    constructor(prisma, realtime) {
        this.prisma = prisma;
        this.realtime = realtime;
    }
    async notifyByPermission(branchId, permissionKey, payload) {
        const recipients = await this.prisma.user.findMany({
            where: {
                isActive: true,
                branches: { some: { branchId } },
                role: {
                    permissions: { some: { permission: { key: permissionKey } } },
                },
            },
            select: { id: true },
        });
        if (recipients.length === 0)
            return;
        await this.prisma.notification.createMany({
            data: recipients.map((r) => ({
                branchId,
                recipientUserId: r.id,
                type: payload.type,
                title: payload.title,
                body: payload.body,
                entity: payload.entity ?? null,
                entityId: payload.entityId ?? null,
            })),
        });
        this.realtime.emitToUsers(recipients.map((r) => r.id), 'notification.created', payload);
    }
    async notifyUser(userId, branchId, payload) {
        await this.prisma.notification.create({
            data: {
                branchId,
                recipientUserId: userId,
                type: payload.type,
                title: payload.title,
                body: payload.body,
                entity: payload.entity ?? null,
                entityId: payload.entityId ?? null,
            },
        });
        this.realtime.emitToUsers([userId], 'notification.created', payload);
    }
    async list(userId, query) {
        const { unreadOnly, page, pageSize } = query;
        const where = {
            recipientUserId: userId,
            ...(unreadOnly ? { readAt: null } : {}),
        };
        const [data, total, unreadCount] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.notification.count({ where }),
            this.prisma.notification.count({
                where: { recipientUserId: userId, readAt: null },
            }),
        ]);
        return {
            data,
            total,
            unreadCount,
            page,
            pageSize,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
        };
    }
    async markRead(userId, id) {
        const notification = await this.prisma.notification.findFirst({
            where: { id, recipientUserId: userId },
            select: { id: true, readAt: true },
        });
        if (!notification)
            throw new common_1.NotFoundException('Notification not found');
        if (notification.readAt)
            return notification;
        return this.prisma.notification.update({
            where: { id },
            data: { readAt: new Date() },
        });
    }
    async markAllRead(userId) {
        await this.prisma.notification.updateMany({
            where: { recipientUserId: userId, readAt: null },
            data: { readAt: new Date() },
        });
        return { ok: true };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        realtime_gateway_1.RealtimeGateway])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map