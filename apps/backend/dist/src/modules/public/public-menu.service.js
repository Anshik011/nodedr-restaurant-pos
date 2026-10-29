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
exports.PublicMenuService = void 0;
const common_1 = require("@nestjs/common");
const notifications_service_1 = require("../../notifications/notifications.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const realtime_gateway_1 = require("../../realtime/realtime.gateway");
const orders_service_1 = require("../orders/orders.service");
let PublicMenuService = class PublicMenuService {
    prisma;
    ordersService;
    notifications;
    realtime;
    constructor(prisma, ordersService, notifications, realtime) {
        this.prisma = prisma;
        this.ordersService = ordersService;
        this.notifications = notifications;
        this.realtime = realtime;
    }
    async resolveTable(qrToken) {
        const table = await this.prisma.table.findUnique({
            where: { qrToken },
            include: { floor: { include: { branch: true } } },
        });
        if (!table)
            throw new common_1.NotFoundException('This QR code is not recognized');
        return table;
    }
    async getMenuByQrToken(qrToken) {
        const table = await this.resolveTable(qrToken);
        const branch = table.floor.branch;
        const categories = await this.menuCategoriesForBranch(branch.id);
        return {
            branchName: branch.name,
            tableName: table.name ?? `Table ${table.number}`,
            categories,
        };
    }
    menuCategoriesForBranch(branchId) {
        return this.prisma.menuCategory.findMany({
            where: { branchId, isActive: true, showOnWebsite: true },
            orderBy: { sortOrder: 'asc' },
            include: {
                items: {
                    where: { isActive: true },
                    orderBy: { sortOrder: 'asc' },
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        imageUrl: true,
                        price: true,
                        taxRatePercent: true,
                        isVeg: true,
                        isVegan: true,
                        spiceLevel: true,
                        allergens: true,
                        modifierGroups: {
                            orderBy: { sortOrder: 'asc' },
                            select: {
                                modifierGroup: {
                                    select: {
                                        id: true,
                                        name: true,
                                        minSelect: true,
                                        maxSelect: true,
                                        isRequired: true,
                                        modifiers: {
                                            orderBy: { sortOrder: 'asc' },
                                            select: {
                                                id: true,
                                                name: true,
                                                priceAdjustment: true,
                                                isDefault: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    }
    async createOrder(qrToken, items, guestName) {
        const table = await this.resolveTable(qrToken);
        const branchId = table.floor.branchId;
        const openOrder = await this.prisma.order.findFirst({
            where: { branchId, tableId: table.id, status: 'OPEN' },
        });
        if (openOrder) {
            return this.ordersService.addItems(branchId, openOrder.id, items, {
                enforceModifierLimits: true,
                websiteOnly: true,
            });
        }
        const createdById = table.assignedWaiterId ??
            (await this.prisma.userBranch.findFirst({
                where: { branchId },
                orderBy: { userId: 'asc' },
            }))?.userId;
        if (!createdById) {
            throw new common_1.NotFoundException('This branch has no staff to receive the order');
        }
        return this.ordersService.createOrder(branchId, createdById, {
            type: 'QR_ORDER',
            tableId: table.id,
            guestName,
            items,
        }, { channel: 'ONLINE' });
    }
    async getStatus(qrToken) {
        const table = await this.resolveTable(qrToken);
        const order = await this.prisma.order.findFirst({
            where: { tableId: table.id, status: { in: ['OPEN', 'BILLED'] } },
            orderBy: { createdAt: 'desc' },
            select: {
                orderNumber: true,
                status: true,
                acceptance: true,
                totalAmount: true,
                items: {
                    select: {
                        id: true,
                        nameSnapshot: true,
                        quantity: true,
                        status: true,
                    },
                },
            },
        });
        const requests = await this.prisma.tableRequest.findMany({
            where: { tableId: table.id, resolvedAt: null },
            select: { type: true },
        });
        return { order, openRequests: requests.map((r) => r.type) };
    }
    async createRequest(qrToken, type) {
        const table = await this.resolveTable(qrToken);
        const branchId = table.floor.branchId;
        const existing = await this.prisma.tableRequest.findFirst({
            where: { tableId: table.id, type, resolvedAt: null },
        });
        if (existing)
            return { ok: true, alreadyRequested: true };
        const request = await this.prisma.tableRequest.create({
            data: { branchId, tableId: table.id, type },
        });
        this.realtime.emitToBranch(branchId, 'table.request', { id: request.id });
        const tableName = table.name ?? `Table ${table.number}`;
        try {
            await this.notifications.notifyByPermission(branchId, 'tables.manage', {
                type: type === 'BILL' ? 'table.bill' : 'table.waiter',
                title: type === 'BILL'
                    ? `${tableName} wants the bill`
                    : `${tableName} needs a waiter`,
                body: 'Requested from the table QR code',
                entity: 'Table',
                entityId: table.id,
            });
        }
        catch {
        }
        return { ok: true, alreadyRequested: false };
    }
};
exports.PublicMenuService = PublicMenuService;
exports.PublicMenuService = PublicMenuService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        orders_service_1.OrdersService,
        notifications_service_1.NotificationsService,
        realtime_gateway_1.RealtimeGateway])
], PublicMenuService);
//# sourceMappingURL=public-menu.service.js.map