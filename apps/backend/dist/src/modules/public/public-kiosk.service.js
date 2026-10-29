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
exports.PublicKioskService = void 0;
const common_1 = require("@nestjs/common");
const types_1 = require("@nodedr-restaurant/types");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const orders_service_1 = require("../orders/orders.service");
const public_menu_service_1 = require("./public-menu.service");
const SERVICE_LABEL = { DINE_IN: 'Dine-in', TAKEAWAY: 'Takeaway' };
const MAX_ORDER_ATTEMPTS = 3;
let PublicKioskService = class PublicKioskService {
    prisma;
    ordersService;
    publicMenu;
    constructor(prisma, ordersService, publicMenu) {
        this.prisma = prisma;
        this.ordersService = ordersService;
        this.publicMenu = publicMenu;
    }
    async resolveBranch(kioskToken) {
        if (!/^[a-f0-9]{32}$/.test(kioskToken)) {
            throw new common_1.NotFoundException('This kiosk is not available');
        }
        const branch = await this.prisma.branch.findUnique({
            where: { kioskToken },
            include: { restaurant: true },
        });
        if (!branch || !branch.isActive) {
            throw new common_1.NotFoundException('This kiosk is not available');
        }
        return branch;
    }
    async getMenu(kioskToken) {
        const branch = await this.resolveBranch(kioskToken);
        const categories = await this.publicMenu.menuCategoriesForBranch(branch.id);
        return {
            restaurantName: branch.restaurant.name,
            branchName: branch.name,
            logoUrl: branch.restaurant.logoUrl ?? null,
            currency: branch.restaurant.currency,
            country: branch.country,
            taxMode: branch.taxMode,
            taxLabel: (0, types_1.resolveTaxLabel)(branch.taxRegime, branch.taxLabel),
            services: {
                dineIn: branch.kioskDineInEnabled,
                takeaway: branch.kioskTakeawayEnabled,
            },
            categories: categories.filter((c) => c.items.length > 0),
        };
    }
    async createOrder(kioskToken, dto) {
        const branch = await this.resolveBranch(kioskToken);
        if ((dto.serviceType === 'DINE_IN' && !branch.kioskDineInEnabled) ||
            (dto.serviceType === 'TAKEAWAY' && !branch.kioskTakeawayEnabled)) {
            throw new common_1.BadRequestException('That service option is not available');
        }
        const existing = await this.findByRequestId(branch.id, dto.requestId);
        if (existing)
            return this.present(existing, branch.restaurant.currency);
        await this.assertAvailable(branch.id, dto.items);
        const createdById = await this.resolveActor(branch.id);
        for (let attempt = 1;; attempt++) {
            try {
                const order = await this.ordersService.createOrder(branch.id, createdById, {
                    type: 'KIOSK',
                    notes: `Kiosk · ${SERVICE_LABEL[dto.serviceType]}`,
                    items: dto.items.map((i) => ({
                        menuItemId: i.menuItemId,
                        quantity: i.quantity,
                        modifierIds: i.modifierIds,
                    })),
                }, { channel: 'ONLINE', clientRequestId: dto.requestId });
                return this.present(order, branch.restaurant.currency);
            }
            catch (err) {
                if (err instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                    err.code === 'P2002') {
                    const dup = await this.findByRequestId(branch.id, dto.requestId);
                    if (dup)
                        return this.present(dup, branch.restaurant.currency);
                    if (attempt < MAX_ORDER_ATTEMPTS)
                        continue;
                }
                throw err;
            }
        }
    }
    findByRequestId(branchId, clientRequestId) {
        return this.prisma.order.findFirst({
            where: { branchId, clientRequestId },
            include: { items: true },
        });
    }
    async assertAvailable(branchId, items) {
        const ids = [...new Set(items.map((i) => i.menuItemId))];
        const found = await this.prisma.menuItem.findMany({
            where: { id: { in: ids }, branchId },
            select: {
                id: true,
                isActive: true,
                category: { select: { isActive: true } },
            },
        });
        const byId = new Map(found.map((m) => [m.id, m]));
        const unavailable = ids.filter((id) => {
            const m = byId.get(id);
            return !m || !m.isActive || !m.category.isActive;
        });
        if (unavailable.length > 0) {
            throw new common_1.ConflictException({
                statusCode: 409,
                code: 'ITEM_UNAVAILABLE',
                message: 'Some items are no longer available',
                unavailableItemIds: unavailable,
            });
        }
    }
    async resolveActor(branchId) {
        const link = await this.prisma.userBranch.findFirst({
            where: { branchId },
            orderBy: { userId: 'asc' },
        });
        if (!link) {
            throw new common_1.NotFoundException('This branch has no staff to receive the order');
        }
        return link.userId;
    }
    present(order, currency) {
        return {
            orderNumber: order.orderNumber,
            createdAt: order.createdAt,
            currency,
            items: order.items.map((i) => ({
                name: i.nameSnapshot,
                quantity: i.quantity,
                lineTotal: i.lineTotal.toString(),
            })),
            subtotal: order.subtotal.toString(),
            taxAmount: order.taxAmount.toString(),
            totalAmount: order.totalAmount.toString(),
            paid: false,
        };
    }
};
exports.PublicKioskService = PublicKioskService;
exports.PublicKioskService = PublicKioskService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        orders_service_1.OrdersService,
        public_menu_service_1.PublicMenuService])
], PublicKioskService);
//# sourceMappingURL=public-kiosk.service.js.map