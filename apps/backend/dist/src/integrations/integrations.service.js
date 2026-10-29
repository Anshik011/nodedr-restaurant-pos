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
exports.IntegrationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const delivery_service_1 = require("../modules/delivery/delivery.service");
const orders_service_1 = require("../modules/orders/orders.service");
const reservations_service_1 = require("../modules/reservations/reservations.service");
let IntegrationsService = class IntegrationsService {
    prisma;
    orders;
    delivery;
    reservations;
    constructor(prisma, orders, delivery, reservations) {
        this.prisma = prisma;
        this.orders = orders;
        this.delivery = delivery;
        this.reservations = reservations;
    }
    async assertBranch(ctx, branchId) {
        if (ctx.branchId && ctx.branchId !== branchId) {
            throw new common_1.ForbiddenException('This API key is scoped to a different location');
        }
        const branch = await this.prisma.branch.findFirst({
            where: { id: branchId, restaurantId: ctx.restaurantId, isActive: true },
        });
        if (!branch) {
            throw new common_1.NotFoundException('Location not found');
        }
        return branch;
    }
    async listLocations(ctx) {
        return this.prisma.branch.findMany({
            where: {
                restaurantId: ctx.restaurantId,
                isActive: true,
                ...(ctx.branchId ? { id: ctx.branchId } : {}),
            },
            select: { id: true, name: true, address: true, phone: true },
            orderBy: { name: 'asc' },
        });
    }
    async getMenu(ctx, branchId) {
        const branch = await this.assertBranch(ctx, branchId);
        const categories = await this.prisma.menuCategory.findMany({
            where: { branchId: branch.id, isActive: true, showOnWebsite: true },
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
                        isVeg: true,
                        isVegan: true,
                        spiceLevel: true,
                        allergens: true,
                    },
                },
            },
        });
        return { locationId: branch.id, locationName: branch.name, categories };
    }
    async createOrder(ctx, branchId, dto) {
        await this.assertBranch(ctx, branchId);
        const existing = await this.prisma.customer.findFirst({
            where: { branchId, phone: dto.customerPhone },
        });
        const customer = existing
            ? await this.prisma.customer.update({
                where: { id: existing.id },
                data: { name: dto.customerName || existing.name },
            })
            : await this.prisma.customer.create({
                data: { branchId, name: dto.customerName, phone: dto.customerPhone },
            });
        const createdById = (await this.prisma.userBranch.findFirst({
            where: { branchId },
            orderBy: { userId: 'asc' },
        }))?.userId;
        if (!createdById) {
            throw new common_1.NotFoundException('This location has no staff to receive the order');
        }
        return this.orders.createOrder(branchId, createdById, {
            type: dto.type,
            customerId: customer.id,
            guestName: dto.customerName,
            notes: dto.notes,
            delivery: dto.delivery,
            scheduledFor: dto.scheduledFor,
            items: dto.items.map((item) => ({
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                modifierIds: item.modifierIds,
                kitchenNote: item.kitchenNote,
            })),
        }, { channel: 'ONLINE', requireAcceptance: true });
    }
    async deliveryQuote(ctx, branchId, pincode) {
        await this.assertBranch(ctx, branchId);
        return this.delivery.quote(branchId, pincode);
    }
    async getOrder(ctx, branchId, orderId) {
        await this.assertBranch(ctx, branchId);
        return this.orders.getOrder(branchId, orderId);
    }
    async createReservation(ctx, branchId, dto) {
        await this.assertBranch(ctx, branchId);
        return this.reservations.create(branchId, dto, { fromWebsite: true });
    }
    async getReservation(ctx, branchId, reservationId) {
        await this.assertBranch(ctx, branchId);
        const reservation = await this.prisma.reservation.findFirst({
            where: { id: reservationId, branchId },
        });
        if (!reservation)
            throw new common_1.NotFoundException('Reservation not found');
        return reservation;
    }
};
exports.IntegrationsService = IntegrationsService;
exports.IntegrationsService = IntegrationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        orders_service_1.OrdersService,
        delivery_service_1.DeliveryService,
        reservations_service_1.ReservationsService])
], IntegrationsService);
//# sourceMappingURL=integrations.service.js.map