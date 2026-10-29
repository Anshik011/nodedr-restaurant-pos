"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const types_1 = require("@nodedr-restaurant/types");
const audit_service_1 = require("../../audit/audit.service");
const notifications_service_1 = require("../../notifications/notifications.service");
const gift_cards_service_1 = require("../gift-cards/gift-cards.service");
const inventory_service_1 = require("../inventory/inventory.service");
const marketing_service_1 = require("../marketing/marketing.service");
const webhooks_service_1 = require("../webhooks/webhooks.service");
const encoder_1 = require("./escpos/encoder");
const prisma_service_1 = require("../../prisma/prisma.service");
const realtime_gateway_1 = require("../../realtime/realtime.gateway");
const pricing_1 = require("./pricing");
const settlement_1 = require("./settlement");
const verifactu_service_1 = require("../verifactu/verifactu.service");
const KOT_FORWARD_STATUSES = [
    'ACCEPTED',
    'PREPARING',
    'READY',
    'SERVED',
];
let OrdersService = class OrdersService {
    static { OrdersService_1 = this; }
    prisma;
    realtime;
    giftCards;
    inventory;
    audit;
    notifications;
    marketing;
    webhooks;
    verifactu;
    logger = new common_1.Logger(OrdersService_1.name);
    constructor(prisma, realtime, giftCards, inventory, audit, notifications, marketing, webhooks, verifactu) {
        this.prisma = prisma;
        this.realtime = realtime;
        this.giftCards = giftCards;
        this.inventory = inventory;
        this.audit = audit;
        this.notifications = notifications;
        this.marketing = marketing;
        this.webhooks = webhooks;
        this.verifactu = verifactu;
    }
    async listOpen(branchId, tableId) {
        return this.prisma.order.findMany({
            where: { branchId, status: 'OPEN', ...(tableId ? { tableId } : {}) },
            include: { table: true, items: true, customer: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getOrder(branchId, id) {
        const order = await this.prisma.order.findFirst({
            where: { id, branchId },
            include: {
                table: true,
                customer: true,
                items: { include: { modifiers: true, menuItem: true } },
                kots: { include: { items: true, station: true } },
                payments: true,
            },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
    async printerProfile(branchId) {
        const branch = await this.prisma.branch.findUnique({
            where: { id: branchId },
            select: {
                printerPaperWidthMm: true,
                printerCodepage: true,
                printerColumns: true,
            },
        });
        return (0, encoder_1.resolveProfile)({
            paperWidthMm: branch?.printerPaperWidthMm,
            codepage: branch?.printerCodepage,
            columns: branch?.printerColumns,
        });
    }
    async getReceiptData(branchId, id) {
        const order = await this.prisma.order.findFirst({
            where: { id, branchId },
            include: {
                table: true,
                customer: true,
                items: { include: { modifiers: true } },
                payments: true,
                branch: { include: { restaurant: true } },
            },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
    async assertOrderableOnWebsite(branchId, menuItemIds) {
        const hidden = await this.prisma.menuItem.findMany({
            where: {
                id: { in: menuItemIds },
                branchId,
                category: { showOnWebsite: false },
            },
            select: { name: true },
        });
        if (hidden.length > 0) {
            throw new common_1.BadRequestException(`${hidden.map((h) => `"${h.name}"`).join(', ')} is not available for online ordering`);
        }
    }
    async getBranchTaxMode(branchId) {
        const branch = await this.prisma.branch.findUnique({
            where: { id: branchId },
            select: { taxMode: true },
        });
        return branch?.taxMode ?? 'INCLUSIVE';
    }
    async createOrder(branchId, userId, dto, options = {}) {
        const channel = options.channel ?? 'STAFF';
        let acceptance = 'NOT_REQUIRED';
        if (options.requireAcceptance) {
            const branch = await this.prisma.branch.findUnique({
                where: { id: branchId },
                select: { autoConfirmOrders: true },
            });
            acceptance = branch?.autoConfirmOrders ? 'ACCEPTED' : 'PENDING';
        }
        const menuItemIds = [...new Set(dto.items.map((i) => i.menuItemId))];
        if (channel === 'ONLINE')
            await this.assertOrderableOnWebsite(branchId, menuItemIds);
        const menuItems = await this.prisma.menuItem.findMany({
            where: { id: { in: menuItemIds }, branchId },
        });
        if (menuItems.length !== menuItemIds.length) {
            throw new common_1.BadRequestException('One or more menu items are invalid for this branch');
        }
        const menuItemById = new Map(menuItems.map((m) => [m.id, m]));
        const taxMode = await this.getBranchTaxMode(branchId);
        const modifierIds = [...new Set(dto.items.flatMap((i) => i.modifierIds))];
        const modifiers = await this.prisma.modifier.findMany({
            where: { id: { in: modifierIds } },
        });
        const modifierById = new Map(modifiers.map((m) => [m.id, m]));
        if (modifiers.length !== modifierIds.length) {
            throw new common_1.BadRequestException('One or more modifiers are invalid');
        }
        await this.validateModifierSelections(branchId, dto.items, channel === 'ONLINE');
        if (dto.tableId) {
            const table = await this.prisma.table.findFirst({
                where: { id: dto.tableId, floor: { branchId } },
                select: { id: true },
            });
            if (!table) {
                throw new common_1.BadRequestException('Table is invalid for this branch');
            }
        }
        if (dto.customerId) {
            const customer = await this.prisma.customer.findFirst({
                where: { id: dto.customerId, branchId },
                select: { id: true },
            });
            if (!customer) {
                throw new common_1.BadRequestException('Customer is invalid for this branch');
            }
        }
        const lineInputs = dto.items.map((cartItem) => this.buildLine(cartItem, menuItemById, modifierById, taxMode, channel !== 'ONLINE'));
        const totals = (0, pricing_1.computeOrderTotals)(lineInputs.map((l) => l.priced));
        let delivery = null;
        if (dto.type === 'DELIVERY') {
            const hasZones = (await this.prisma.deliveryZone.count({
                where: { branchId, isActive: true },
            })) > 0;
            if (hasZones && !dto.delivery) {
                throw new common_1.BadRequestException('Delivery orders need an address, pincode and phone');
            }
            delivery = {
                deliveryStatus: 'UNASSIGNED',
                deliveryAddress: dto.delivery?.address,
                deliveryPincode: dto.delivery?.pincode,
                deliveryPhone: dto.delivery?.phone,
            };
            if (hasZones && dto.delivery) {
                const zone = await this.prisma.deliveryZone.findFirst({
                    where: {
                        branchId,
                        isActive: true,
                        pincodes: { has: dto.delivery.pincode },
                    },
                });
                if (!zone) {
                    throw new common_1.BadRequestException('Sorry, we do not deliver to that pincode');
                }
                if (totals.subtotal < Number(zone.minOrderAmount)) {
                    throw new common_1.BadRequestException(`Minimum order for ${zone.name} is ₹${Number(zone.minOrderAmount)}`);
                }
                delivery.deliveryZoneId = zone.id;
                delivery.deliveryFee = zone.fee;
                delivery.deliveryEtaAt = new Date(Date.now() + zone.etaMinutes * 60_000);
            }
        }
        let scheduledFor;
        if (dto.scheduledFor) {
            scheduledFor = new Date(dto.scheduledFor);
            if (scheduledFor.getTime() < Date.now() + 10 * 60_000) {
                throw new common_1.BadRequestException('Scheduled time must be at least 10 minutes from now');
            }
        }
        const orderNumber = await this.nextOrderNumber(branchId);
        const order = await this.prisma.$transaction(async (tx) => {
            const created = await tx.order.create({
                data: {
                    branchId,
                    orderNumber,
                    type: dto.type,
                    channel,
                    acceptance,
                    tableId: dto.tableId,
                    guestCount: dto.guestCount,
                    customerId: dto.customerId,
                    guestName: dto.guestName,
                    notes: dto.notes,
                    clientRequestId: options.clientRequestId,
                    createdById: userId,
                    subtotal: totals.subtotal,
                    taxAmount: totals.taxAmount,
                    discountAmount: 0,
                    totalAmount: totals.subtotal,
                    scheduledFor,
                    ...(delivery
                        ? {
                            deliveryZoneId: delivery.deliveryZoneId,
                            deliveryFee: delivery.deliveryFee,
                            deliveryAddress: delivery.deliveryAddress,
                            deliveryPincode: delivery.deliveryPincode,
                            deliveryPhone: delivery.deliveryPhone,
                            deliveryStatus: delivery.deliveryStatus,
                            deliveryEtaAt: delivery.deliveryEtaAt,
                        }
                        : {}),
                    items: {
                        create: lineInputs.map((line) => ({
                            menuItem: { connect: { id: line.menuItem.id } },
                            nameSnapshot: line.menuItem.name,
                            unitPriceSnapshot: line.menuItem.price,
                            taxRateSnapshot: line.menuItem.taxRatePercent,
                            quantity: line.cartItem.quantity,
                            lineTotal: line.priced.lineTotal,
                            kitchenNote: line.cartItem.kitchenNote,
                            modifiers: {
                                create: line.selectedModifiers.map((m) => ({
                                    modifier: { connect: { id: m.id } },
                                    nameSnapshot: m.name,
                                    priceAdjSnapshot: m.priceAdjustment,
                                })),
                            },
                        })),
                    },
                },
                include: { items: true },
            });
            if (dto.tableId) {
                await tx.table.update({
                    where: { id: dto.tableId },
                    data: { status: 'OCCUPIED', statusSince: new Date() },
                });
            }
            if (acceptance !== 'PENDING' && !this.isDeferred(scheduledFor)) {
                await this.generateKots(tx, created.id, branchId, created.items);
            }
            return created;
        });
        this.realtime.emitToBranch(branchId, 'order.created', {
            id: order.id,
            acceptance,
        });
        const full = await this.getOrder(branchId, order.id);
        try {
            const who = full.guestName ?? full.customer?.name ?? undefined;
            if (acceptance === 'PENDING') {
                await this.notifications.notifyByPermission(branchId, 'orders.accept', {
                    type: 'order.pending',
                    title: 'New online order — accept?',
                    body: `Order ${full.orderNumber} (${full.type.replace('_', ' ')})${who ? ` — ${who}` : ''} · ₹${Number(full.totalAmount)}`,
                    entity: 'Order',
                    entityId: full.id,
                });
            }
            else {
                await this.notifications.notifyByPermission(branchId, 'kds.manage', {
                    type: 'order.new',
                    title: channel === 'ONLINE' ? 'New online order' : 'New order',
                    body: full.table
                        ? `Order ${full.orderNumber} — Table ${full.table.number}`
                        : `Order ${full.orderNumber} (${full.type})`,
                    entity: 'Order',
                    entityId: full.id,
                });
            }
        }
        catch (err) {
            this.logger.warn(`Failed to send new-order notification for order ${full.id}: ${err instanceof Error ? err.message : String(err)}`);
        }
        void this.webhooks.emitForBranch(branchId, 'order.created', {
            orderId: full.id,
            orderNumber: full.orderNumber,
            type: full.type,
            channel: full.channel,
            total: Number(full.totalAmount),
            deliveryAddress: full.deliveryAddress,
            deliveryPhone: full.deliveryPhone,
            scheduledFor: full.scheduledFor,
        });
        return full;
    }
    async addItems(branchId, orderId, items, options = {}) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, branchId },
            include: { items: true, payments: { select: { id: true } } },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        this.assertNoPayments(order);
        await this.validateModifierSelections(branchId, items, options.enforceModifierLimits ?? false);
        if (order.status !== 'OPEN') {
            throw new common_1.BadRequestException('Order is not open — cannot add items');
        }
        const menuItemIds = [...new Set(items.map((i) => i.menuItemId))];
        if (options.websiteOnly)
            await this.assertOrderableOnWebsite(branchId, menuItemIds);
        const menuItems = await this.prisma.menuItem.findMany({
            where: { id: { in: menuItemIds }, branchId },
        });
        if (menuItems.length !== menuItemIds.length) {
            throw new common_1.BadRequestException('One or more menu items are invalid for this branch');
        }
        const menuItemById = new Map(menuItems.map((m) => [m.id, m]));
        const taxMode = await this.getBranchTaxMode(branchId);
        const modifierIds = [...new Set(items.flatMap((i) => i.modifierIds))];
        const modifiers = await this.prisma.modifier.findMany({
            where: { id: { in: modifierIds } },
        });
        const modifierById = new Map(modifiers.map((m) => [m.id, m]));
        if (modifiers.length !== modifierIds.length) {
            throw new common_1.BadRequestException('One or more modifiers are invalid');
        }
        const lineInputs = items.map((cartItem) => this.buildLine(cartItem, menuItemById, modifierById, taxMode, !options.websiteOnly && !options.enforceModifierLimits));
        const updated = await this.prisma.$transaction(async (tx) => {
            const newItems = await Promise.all(lineInputs.map((line) => tx.orderItem.create({
                data: {
                    orderId,
                    menuItemId: line.menuItem.id,
                    nameSnapshot: line.menuItem.name,
                    unitPriceSnapshot: line.menuItem.price,
                    taxRateSnapshot: line.menuItem.taxRatePercent,
                    quantity: line.cartItem.quantity,
                    lineTotal: line.priced.lineTotal,
                    kitchenNote: line.cartItem.kitchenNote,
                    modifiers: {
                        create: line.selectedModifiers.map((m) => ({
                            modifier: { connect: { id: m.id } },
                            nameSnapshot: m.name,
                            priceAdjSnapshot: m.priceAdjustment,
                        })),
                    },
                },
            })));
            const allLines = [...order.items, ...newItems].map((item) => (0, pricing_1.priceLine)({
                quantity: item.quantity,
                unitPriceInclusive: Number(item.lineTotal) / item.quantity,
                taxRatePercent: Number(item.taxRateSnapshot),
            }));
            const totals = (0, pricing_1.computeOrderTotals)(allLines);
            const result = await tx.order.update({
                where: { id: orderId },
                data: {
                    subtotal: totals.subtotal,
                    taxAmount: totals.taxAmount,
                    totalAmount: totals.subtotal,
                },
            });
            await this.generateKots(tx, orderId, branchId, newItems);
            return result;
        });
        this.realtime.emitToBranch(branchId, 'order.updated', { id: orderId });
        return this.getOrder(branchId, updated.id);
    }
    async listForManagement(branchId, filters) {
        const tab = filters.tab ?? 'active';
        const statusWhere = tab === 'pending'
            ? { status: 'OPEN', acceptance: 'PENDING' }
            : tab === 'active'
                ? {
                    status: { in: ['OPEN', 'BILLED'] },
                    acceptance: { not: 'PENDING' },
                }
                : {
                    OR: [
                        { status: { in: ['PAID', 'CANCELLED'] } },
                        { acceptance: 'REJECTED' },
                    ],
                    createdAt: { gte: new Date(Date.now() - 7 * 86_400_000) },
                };
        return this.prisma.order.findMany({
            where: {
                branchId,
                ...statusWhere,
                ...(filters.channel ? { channel: filters.channel } : {}),
                ...(filters.type ? { type: filters.type } : {}),
            },
            include: { table: true, customer: true, items: true },
            orderBy: { createdAt: 'desc' },
            take: 200,
        });
    }
    async acceptOrder(branchId, orderId, userId) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, branchId },
            include: { items: true },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.status !== 'OPEN' || order.acceptance !== 'PENDING') {
            throw new common_1.ConflictException(order.acceptance === 'ACCEPTED'
                ? 'This order was already accepted'
                : order.acceptance === 'REJECTED' || order.status === 'CANCELLED'
                    ? 'This order was already declined or cancelled'
                    : 'This order is not waiting for acceptance');
        }
        await this.prisma.$transaction(async (tx) => {
            const flipped = await tx.order.updateMany({
                where: { id: orderId, status: 'OPEN', acceptance: 'PENDING' },
                data: {
                    acceptance: 'ACCEPTED',
                    acceptedAt: new Date(),
                    acceptedById: userId,
                },
            });
            if (flipped.count === 0) {
                throw new common_1.ConflictException('This order was just accepted or declined by someone else');
            }
            if (!this.isDeferred(order.scheduledFor ?? undefined)) {
                await this.generateKots(tx, orderId, branchId, order.items);
            }
        });
        this.realtime.emitToBranch(branchId, 'order.updated', {
            id: orderId,
            acceptance: 'ACCEPTED',
        });
        this.realtime.emitToBranch(branchId, 'kot.updated', { orderId });
        await this.audit.record({
            userId,
            action: 'order.accepted',
            entity: 'Order',
            entityId: orderId,
            metadata: { orderNumber: order.orderNumber, type: order.type },
        });
        try {
            await this.notifications.notifyByPermission(branchId, 'kds.manage', {
                type: 'order.new',
                title: 'New online order',
                body: `Order ${order.orderNumber} (${order.type.replace('_', ' ')})`,
                entity: 'Order',
                entityId: orderId,
            });
        }
        catch (err) {
            this.logger.warn(`Failed to notify kitchen of accepted order ${orderId}: ${err instanceof Error ? err.message : String(err)}`);
        }
        return this.getOrder(branchId, orderId);
    }
    async rejectOrder(branchId, orderId, userId, reason) {
        return this.withdrawOrder(branchId, orderId, userId, {
            reason,
            source: 'ONLINE_DECLINED',
            declineIncoming: true,
        });
    }
    async deleteFinishedOrders(branchId, actor, orderIds, password) {
        if (!['OWNER', 'ADMINISTRATOR'].includes(actor.roleName)) {
            throw new common_1.ForbiddenException('Only an admin can delete transactions');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: actor.id },
            select: { passwordHash: true },
        });
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            throw new common_1.ForbiddenException('Incorrect admin password');
        }
        const ids = [...new Set(orderIds)];
        const orders = await this.prisma.order.findMany({
            where: { id: { in: ids }, branchId },
            include: { items: true, payments: true },
        });
        if (orders.length !== ids.length) {
            throw new common_1.NotFoundException('Some selected transactions no longer exist');
        }
        const live = orders.filter((o) => !['PAID', 'CANCELLED'].includes(o.status));
        if (live.length > 0) {
            throw new common_1.BadRequestException(`Only finished transactions can be deleted — ${live
                .map((o) => `#${o.orderNumber}`)
                .join(', ')} still in progress`);
        }
        const invoiced = await this.verifactu.ordersWithRecords(ids);
        if (invoiced.length > 0) {
            throw new common_1.BadRequestException('Sales with a VERI*FACTU invoice cannot be deleted - the fiscal log must keep them. Refund the sale instead.');
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.auditLog.createMany({
                data: orders.map((o) => ({
                    userId: actor.id,
                    action: 'order.deleted',
                    entity: 'Order',
                    entityId: o.id,
                    metadata: {
                        orderNumber: o.orderNumber,
                        status: o.status,
                        type: o.type,
                        totalAmount: o.totalAmount.toString(),
                        createdAt: o.createdAt.toISOString(),
                        items: o.items.map((i) => `${i.quantity}x ${i.nameSnapshot}`),
                        payments: o.payments.map((p) => ({
                            method: p.method,
                            amount: p.amount.toString(),
                        })),
                    },
                })),
            });
            await tx.order.deleteMany({ where: { id: { in: ids }, branchId } });
        });
        this.realtime.emitToBranch(branchId, 'order.deleted', { orderIds: ids });
        return { deleted: ids.length };
    }
    async releaseTableIfIdle(tx, tableId, exceptOrderId) {
        if (!tableId)
            return;
        const stillOpen = await tx.order.count({
            where: { tableId, status: 'OPEN', id: { not: exceptOrderId } },
        });
        if (stillOpen === 0) {
            await tx.table.update({
                where: { id: tableId },
                data: { status: 'AVAILABLE', statusSince: new Date() },
            });
        }
    }
    async printerTarget(branchId) {
        const branch = await this.prisma.branch.findUnique({
            where: { id: branchId },
            select: {
                printerConnection: true,
                printerHost: true,
                printerPort: true,
            },
        });
        return (branch ?? {
            printerConnection: 'USB',
            printerHost: null,
            printerPort: 9100,
        });
    }
    async cancelOrder(branchId, orderId, userId, reason, options = {}) {
        return this.withdrawOrder(branchId, orderId, userId, {
            reason,
            source: options.source ?? 'STAFF',
            confirmStarted: options.confirmStarted,
        });
    }
    async withdrawOrder(branchId, orderId, userId, options) {
        const reason = options.reason?.trim() || undefined;
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, branchId },
            include: { kots: true, payments: true },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (options.declineIncoming) {
            if (order.status !== 'OPEN' || order.acceptance !== 'PENDING') {
                throw new common_1.ConflictException('This order is not waiting for acceptance - it may already have been accepted or declined');
            }
        }
        else if (order.status !== 'OPEN') {
            throw new common_1.BadRequestException(order.status === 'PAID'
                ? 'This bill is already paid - use Refund to reverse it'
                : 'Only an open order can be cancelled');
        }
        if (order.payments.length > 0) {
            throw new common_1.BadRequestException('This order already has a payment - refund it instead of cancelling');
        }
        const statuses = order.kots.map((k) => k.status);
        if (statuses.includes('SERVED')) {
            throw new common_1.BadRequestException('Part of this order was already served - remove the items that were not served instead of cancelling it');
        }
        const alreadyStarted = statuses.some((st) => types_1.KOT_STARTED_STATUSES.includes(st));
        if (alreadyStarted && !options.confirmStarted) {
            throw new common_1.ConflictException({
                statusCode: 409,
                code: 'KITCHEN_STARTED',
                message: 'The kitchen has already started this order. Confirm to cancel it anyway - the food in progress will be wasted.',
            });
        }
        const pastNew = statuses.some((st) => st !== 'NEW' && st !== 'CANCELLED');
        if (!reason && (pastNew || options.declineIncoming)) {
            throw new common_1.BadRequestException('A reason is required');
        }
        await this.prisma.$transaction(async (tx) => {
            const flipped = await tx.order.updateMany({
                where: {
                    id: orderId,
                    status: 'OPEN',
                    ...(options.declineIncoming ? { acceptance: 'PENDING' } : {}),
                },
                data: {
                    status: 'CANCELLED',
                    cancelReason: reason ?? null,
                    cancelledAt: new Date(),
                    cancelledById: userId,
                    cancelSource: options.source,
                    ...(options.declineIncoming ? { acceptance: 'REJECTED' } : {}),
                },
            });
            if (flipped.count === 0) {
                throw new common_1.ConflictException('This order was just paid or changed - refresh and check it');
            }
            await tx.kot.updateMany({
                where: {
                    orderId,
                    status: { notIn: ['SERVED', 'CANCELLED', 'REJECTED'] },
                },
                data: { status: 'CANCELLED' },
            });
            await tx.kotItem.updateMany({
                where: {
                    kot: { orderId },
                    status: { notIn: ['SERVED', 'CANCELLED'] },
                },
                data: { status: 'CANCELLED' },
            });
            await this.releaseTableIfIdle(tx, order.tableId, orderId);
        });
        this.emitOrderWithdrawn(branchId, orderId, order.tableId);
        await this.audit.record({
            userId,
            action: options.declineIncoming ? 'order.declined' : 'order.cancelled',
            entity: 'Order',
            entityId: orderId,
            metadata: {
                orderNumber: order.orderNumber,
                tableId: order.tableId,
                type: order.type,
                source: options.source,
                reason: reason ?? null,
                kitchenStarted: alreadyStarted,
                ticketStatuses: statuses,
                total: order.totalAmount.toString(),
            },
        });
        void this.webhooks.emitForBranch(branchId, 'order.cancelled', {
            orderId,
            orderNumber: order.orderNumber,
            type: order.type,
        });
        return this.getOrder(branchId, orderId);
    }
    emitOrderWithdrawn(branchId, orderId, tableId) {
        this.realtime.emitToBranch(branchId, 'order.updated', {
            id: orderId,
            status: 'CANCELLED',
        });
        this.realtime.emitToBranch(branchId, 'kot.updated', { orderId });
        if (tableId) {
            this.realtime.emitToBranch(branchId, 'table.updated', { id: tableId });
        }
    }
    async recomputeTotals(tx, orderId) {
        const items = await tx.orderItem.findMany({ where: { orderId } });
        const totals = (0, pricing_1.computeOrderTotals)(items.map((item) => (0, pricing_1.priceLine)({
            quantity: item.quantity,
            unitPriceInclusive: Number(item.lineTotal) / item.quantity,
            taxRatePercent: Number(item.taxRateSnapshot),
        })));
        await tx.order.update({
            where: { id: orderId },
            data: {
                subtotal: totals.subtotal,
                taxAmount: totals.taxAmount,
                totalAmount: totals.subtotal,
            },
        });
    }
    async editableOrder(branchId, orderId) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, branchId },
            include: { items: true, payments: { select: { id: true } } },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.status !== 'OPEN') {
            throw new common_1.BadRequestException(order.status === 'PAID'
                ? 'This bill is paid and cannot be edited - use Refund to correct it'
                : 'Only an open bill can be edited');
        }
        this.assertNoPayments(order);
        return order;
    }
    assertNoPayments(order) {
        if (order.payments.length > 0) {
            throw new common_1.ConflictException('A payment has already been taken on this bill - settle the balance, or refund, before changing the items');
        }
    }
    async updateOrder(branchId, orderId, userId, dto) {
        const order = await this.editableOrder(branchId, orderId);
        if (dto.customerId) {
            const customer = await this.prisma.customer.findFirst({
                where: { id: dto.customerId, branchId },
                select: { id: true },
            });
            if (!customer)
                throw new common_1.BadRequestException('Customer not found');
        }
        const moving = dto.tableId && dto.tableId !== order.tableId;
        if (moving) {
            if (order.type !== 'DINE_IN') {
                throw new common_1.BadRequestException('Only dine-in bills have a table');
            }
            const target = await this.prisma.table.findFirst({
                where: { id: dto.tableId, floor: { branchId } },
            });
            if (!target)
                throw new common_1.BadRequestException('Table not found');
            if (target.status === 'OUT_OF_SERVICE') {
                throw new common_1.BadRequestException('That table is out of service');
            }
            const occupant = await this.prisma.order.findFirst({
                where: { tableId: target.id, status: 'OPEN', id: { not: orderId } },
                select: { orderNumber: true },
            });
            if (occupant) {
                throw new common_1.ConflictException(`That table already has open bill #${occupant.orderNumber} - merge the bills instead`);
            }
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.order.update({
                where: { id: orderId },
                data: {
                    ...(moving ? { tableId: dto.tableId } : {}),
                    ...(dto.guestName !== undefined ? { guestName: dto.guestName } : {}),
                    ...(dto.guestCount !== undefined
                        ? { guestCount: dto.guestCount }
                        : {}),
                    ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
                    ...(dto.customerId !== undefined
                        ? { customerId: dto.customerId }
                        : {}),
                },
            });
            if (moving) {
                await tx.table.update({
                    where: { id: dto.tableId },
                    data: { status: 'OCCUPIED', statusSince: new Date() },
                });
                await this.releaseTableIfIdle(tx, order.tableId, orderId);
            }
        });
        this.realtime.emitToBranch(branchId, 'order.updated', { id: orderId });
        this.realtime.emitToBranch(branchId, 'kot.updated', { orderId });
        if (moving) {
            for (const id of [order.tableId, dto.tableId]) {
                if (id)
                    this.realtime.emitToBranch(branchId, 'table.updated', { id });
            }
        }
        await this.audit.record({
            userId,
            action: moving ? 'order.table_changed' : 'order.edited',
            entity: 'Order',
            entityId: orderId,
            metadata: {
                orderNumber: order.orderNumber,
                changes: dto,
                fromTableId: order.tableId,
            },
        });
        return this.getOrder(branchId, orderId);
    }
    async assertLineNotStarted(tx, itemId) {
        const started = await tx.kotItem.findFirst({
            where: {
                orderItemId: itemId,
                OR: [
                    { status: { in: ['PREPARING', 'READY', 'SERVED'] } },
                    { kot: { status: { in: ['PREPARING', 'READY', 'SERVED'] } } },
                ],
            },
        });
        if (started) {
            throw new common_1.ConflictException('The kitchen has already started this item - it can no longer be changed here');
        }
    }
    async updateOrderItem(branchId, orderId, itemId, userId, dto) {
        const order = await this.editableOrder(branchId, orderId);
        const item = order.items.find((i) => i.id === itemId);
        if (!item)
            throw new common_1.NotFoundException('Item not found on this bill');
        if (dto.quantity > item.quantity) {
            throw new common_1.BadRequestException('To order more, add the item again so the kitchen gets a new ticket');
        }
        if (dto.quantity === item.quantity)
            return this.getOrder(branchId, orderId);
        await this.prisma.$transaction(async (tx) => {
            await this.assertLineNotStarted(tx, itemId);
            const unit = Number(item.lineTotal) / item.quantity;
            await tx.orderItem.update({
                where: { id: itemId },
                data: {
                    quantity: dto.quantity,
                    lineTotal: (0, pricing_1.round2)(unit * dto.quantity),
                },
            });
            await this.recomputeTotals(tx, orderId);
        });
        this.realtime.emitToBranch(branchId, 'order.updated', { id: orderId });
        this.realtime.emitToBranch(branchId, 'kot.updated', { orderId });
        await this.audit.record({
            userId,
            action: 'order.item_changed',
            entity: 'Order',
            entityId: orderId,
            metadata: {
                orderNumber: order.orderNumber,
                item: item.nameSnapshot,
                from: item.quantity,
                to: dto.quantity,
                reason: dto.reason ?? null,
            },
        });
        return this.getOrder(branchId, orderId);
    }
    async removeOrderItem(branchId, orderId, itemId, userId, reason) {
        const order = await this.editableOrder(branchId, orderId);
        const item = order.items.find((i) => i.id === itemId);
        if (!item)
            throw new common_1.NotFoundException('Item not found on this bill');
        if (order.items.length === 1) {
            throw new common_1.BadRequestException('This is the only item - cancel the order instead');
        }
        await this.prisma.$transaction(async (tx) => {
            await this.assertLineNotStarted(tx, itemId);
            await tx.orderItem.delete({ where: { id: itemId } });
            const empty = await tx.kot.findMany({
                where: { orderId, items: { none: {} }, status: { not: 'CANCELLED' } },
                select: { id: true },
            });
            if (empty.length > 0) {
                await tx.kot.updateMany({
                    where: { id: { in: empty.map((k) => k.id) } },
                    data: { status: 'CANCELLED' },
                });
            }
            await this.recomputeTotals(tx, orderId);
        });
        this.realtime.emitToBranch(branchId, 'order.updated', { id: orderId });
        this.realtime.emitToBranch(branchId, 'kot.updated', { orderId });
        await this.audit.record({
            userId,
            action: 'order.item_removed',
            entity: 'Order',
            entityId: orderId,
            metadata: {
                orderNumber: order.orderNumber,
                item: item.nameSnapshot,
                quantity: item.quantity,
                lineTotal: item.lineTotal.toString(),
                reason,
            },
        });
        return this.getOrder(branchId, orderId);
    }
    async previewDiscount(branchId, orderId, couponCode) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, branchId, status: 'OPEN' },
            include: { items: true },
        });
        if (!order)
            throw new common_1.NotFoundException('Open order not found');
        const subtotal = (0, pricing_1.round2)(order.items.reduce((sum, i) => sum + Number(i.lineTotal), 0));
        const d = await this.marketing.resolveCheckoutDiscount(branchId, subtotal, couponCode);
        return {
            amount: d.amount,
            couponCode: d.couponCode ?? null,
            promotionName: d.promotionName ?? null,
        };
    }
    async resolveBill(branchId, order, adj, customerId) {
        const paid = (0, pricing_1.round2)(order.payments.reduce((sum, p) => sum + Number(p.amount), 0));
        const locked = order.payments.length > 0;
        const asked = (adj.discountPercent ?? 0) > 0 ||
            (adj.discountFlat ?? 0) > 0 ||
            (adj.tipAmount ?? 0) > 0 ||
            (adj.loyaltyPointsToRedeem ?? 0) > 0 ||
            !!adj.couponCode;
        if (locked) {
            if (asked) {
                throw new common_1.BadRequestException('Discount, tip and loyalty points are locked once a payment has been taken on this bill');
            }
            const bill = {
                subtotal: Number(order.subtotal),
                discountAmount: Number(order.discountAmount),
                discountPercent: (0, settlement_1.discountPercentOf)(Number(order.subtotal), Number(order.discountAmount)),
                taxAmount: Number(order.taxAmount),
                loyaltyDiscountAmount: Number(order.loyaltyDiscountAmount),
                tipAmount: Number(order.tipAmount),
                deliveryFee: Number(order.deliveryFee),
                totalDue: Number(order.totalAmount),
            };
            return {
                bill,
                locked,
                paid,
                auto: { amount: 0 },
                pointsToRedeem: order.loyaltyPointsRedeemed,
            };
        }
        const branch = await this.prisma.branch.findUniqueOrThrow({
            where: { id: branchId },
            include: { restaurant: true },
        });
        const lines = order.items.map((item) => (0, pricing_1.priceLine)({
            quantity: item.quantity,
            unitPriceInclusive: Number(item.lineTotal) / item.quantity,
            taxRatePercent: Number(item.taxRateSnapshot),
        }));
        const auto = await this.marketing.resolveCheckoutDiscount(branchId, (0, pricing_1.round2)(lines.reduce((sum, l) => sum + l.lineTotal, 0)), adj.couponCode);
        const pointsToRedeem = adj.loyaltyPointsToRedeem ?? 0;
        if (pointsToRedeem > 0 && !customerId) {
            throw new common_1.BadRequestException('Cannot redeem loyalty points without a customer on the order');
        }
        const bill = (0, settlement_1.computeBill)({
            lines,
            discountPercent: adj.discountPercent,
            discountFlat: adj.discountFlat,
            autoDiscount: auto.amount,
            loyaltyDiscountRequested: pointsToRedeem * Number(branch.restaurant.loyaltyPointValue),
            tip: adj.tipAmount,
            deliveryFee: Number(order.deliveryFee),
        });
        return { bill, locked, paid, auto, pointsToRedeem };
    }
    async previewBill(branchId, orderId, adj) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, branchId },
            include: { items: true, payments: true, customer: true },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.status === 'CANCELLED') {
            throw new common_1.BadRequestException('This order was cancelled');
        }
        if (order.status === 'PAID') {
            const total = Number(order.totalAmount);
            return {
                locked: true,
                status: order.status,
                subtotal: Number(order.subtotal),
                discountAmount: Number(order.discountAmount),
                discountPercent: (0, settlement_1.discountPercentOf)(Number(order.subtotal), Number(order.discountAmount)),
                discountType: order.discountType,
                discountValue: order.discountValue ? Number(order.discountValue) : null,
                couponCode: order.couponCode,
                promotionName: order.promotionName,
                taxAmount: Number(order.taxAmount),
                loyaltyPointsRedeemed: order.loyaltyPointsRedeemed,
                loyaltyDiscountAmount: Number(order.loyaltyDiscountAmount),
                tipAmount: Number(order.tipAmount),
                deliveryFee: Number(order.deliveryFee),
                totalDue: total,
                amountPaid: total,
                balanceDue: 0,
            };
        }
        const customerId = order.customerId;
        const { bill, locked, paid, auto, pointsToRedeem } = await this.resolveBill(branchId, order, adj, customerId);
        const entry = locked
            ? order.discountType
                ? {
                    type: order.discountType,
                    value: Number(order.discountValue ?? 0),
                }
                : null
            : (0, settlement_1.manualDiscountEntry)(adj.discountPercent ?? 0, adj.discountFlat ?? 0);
        return {
            locked,
            status: order.status,
            ...bill,
            discountType: entry?.type ?? null,
            discountValue: entry?.value ?? null,
            couponCode: locked ? order.couponCode : (auto.couponCode ?? null),
            promotionName: locked
                ? order.promotionName
                : (auto.promotionName ?? null),
            loyaltyPointsRedeemed: bill.loyaltyDiscountAmount > 0 ? pointsToRedeem : 0,
            amountPaid: paid,
            balanceDue: Math.max((0, pricing_1.round2)(bill.totalDue - paid), 0),
        };
    }
    async getBillForPrint(branchId, orderId, adj) {
        const [order, view] = await Promise.all([
            this.getReceiptData(branchId, orderId),
            this.previewBill(branchId, orderId, adj),
        ]);
        const open = order.status !== 'PAID';
        return {
            order,
            overrides: {
                subtotal: view.subtotal,
                discountAmount: view.discountAmount,
                discountPercent: view.discountPercent,
                taxAmount: view.taxAmount,
                tipAmount: view.tipAmount,
                loyaltyPointsRedeemed: view.loyaltyPointsRedeemed,
                loyaltyDiscountAmount: view.loyaltyDiscountAmount,
                totalAmount: view.totalDue,
                amountPaid: view.amountPaid,
                balanceDue: view.balanceDue,
                isProvisional: open,
            },
        };
    }
    async recordBillPrinted(branchId, orderId, userId) {
        await this.audit.record({
            userId,
            action: 'order.bill_printed',
            entity: 'Order',
            entityId: orderId,
            metadata: { branchId },
        });
    }
    async checkout(branchId, orderId, userId, dto) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, branchId },
            include: { items: true, customer: true, payments: true },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (dto.requestId) {
            const replay = order.payments.some((p) => p.clientRequestId === dto.requestId);
            if (replay)
                return this.checkoutResult(branchId, orderId);
        }
        if (order.status !== 'OPEN') {
            throw new common_1.BadRequestException('Order is not open for checkout');
        }
        if (order.acceptance === 'PENDING') {
            throw new common_1.ConflictException('This order has not been accepted yet - accept it before taking payment');
        }
        const branch = await this.prisma.branch.findUniqueOrThrow({
            where: { id: branchId },
            include: { restaurant: true },
        });
        const loyaltyEarnPerCurrency = branch.restaurant.loyaltyEarnPerCurrency;
        let effectiveCustomerId = order.customerId;
        if (!effectiveCustomerId && dto.customerId) {
            const customer = await this.prisma.customer.findFirst({
                where: { id: dto.customerId, branchId },
            });
            if (!customer)
                throw new common_1.BadRequestException('Customer not found');
            effectiveCustomerId = customer.id;
        }
        const { bill, locked, paid, auto, pointsToRedeem } = await this.resolveBill(branchId, order, dto, effectiveCustomerId);
        const balance = (0, pricing_1.round2)(bill.totalDue - paid);
        const entry = (0, settlement_1.manualDiscountEntry)(dto.discountPercent ?? 0, dto.discountFlat ?? 0);
        let stockSkipped = [];
        let settlement;
        try {
            await this.prisma.$transaction(async (tx) => {
                let actualPointsRedeemed = order.loyaltyPointsRedeemed;
                let loyaltyDiscountAmount = Number(order.loyaltyDiscountAmount);
                if (!locked) {
                    loyaltyDiscountAmount = 0;
                    actualPointsRedeemed = 0;
                    if (auto.couponId) {
                        await this.marketing.redeemCoupon(tx, auto.couponId);
                    }
                    if (pointsToRedeem > 0 && effectiveCustomerId) {
                        const customer = await tx.customer.findUniqueOrThrow({
                            where: { id: effectiveCustomerId },
                        });
                        if (customer.loyaltyPoints < pointsToRedeem) {
                            throw new common_1.BadRequestException(`Customer only has ${customer.loyaltyPoints} loyalty points available`);
                        }
                        actualPointsRedeemed = pointsToRedeem;
                        loyaltyDiscountAmount = bill.loyaltyDiscountAmount;
                        const redeemResult = await tx.customer.updateMany({
                            where: {
                                id: effectiveCustomerId,
                                loyaltyPoints: { gte: pointsToRedeem },
                            },
                            data: { loyaltyPoints: { decrement: pointsToRedeem } },
                        });
                        if (redeemResult.count === 0) {
                            throw new common_1.BadRequestException('Customer loyalty balance changed — please retry checkout');
                        }
                    }
                }
                const manualTotal = (0, pricing_1.round2)(dto.payments.reduce((sum, p) => sum + p.amount, 0));
                let giftCardApplied = 0;
                if (dto.giftCardCode) {
                    const remainingAfterManual = (0, pricing_1.round2)(balance - manualTotal);
                    if (remainingAfterManual > 0) {
                        const result = await this.giftCards.debit(tx, branchId, dto.giftCardCode, remainingAfterManual);
                        giftCardApplied = result.amountApplied;
                        await tx.giftCardRedemption.create({
                            data: {
                                giftCardId: result.giftCardId,
                                orderId,
                                amount: giftCardApplied,
                            },
                        });
                    }
                }
                settlement = (0, settlement_1.settlePayments)({
                    balance,
                    payments: dto.payments,
                    giftCardApplied,
                    allowPartial: dto.allowPartial,
                });
                const paymentRows = settlement.payments.map((p, i) => ({
                    method: p.method,
                    amount: p.amount,
                    tendered: p.tendered,
                    changeGiven: p.changeGiven,
                    reference: p.reference,
                    createdById: userId,
                    clientRequestId: i === 0 ? (dto.requestId ?? null) : null,
                }));
                if (giftCardApplied > 0) {
                    paymentRows.push({
                        method: 'GIFT_CARD',
                        amount: giftCardApplied,
                        tendered: null,
                        changeGiven: null,
                        reference: dto.giftCardCode,
                        createdById: userId,
                        clientRequestId: paymentRows.length === 0 ? (dto.requestId ?? null) : null,
                    });
                }
                const lockedFigures = locked
                    ? {}
                    : {
                        ...(effectiveCustomerId && !order.customerId
                            ? { customerId: effectiveCustomerId }
                            : {}),
                        discountAmount: bill.discountAmount,
                        discountType: entry?.type ?? null,
                        discountValue: entry?.value ?? null,
                        taxAmount: bill.taxAmount,
                        couponCode: auto.couponCode ?? null,
                        promotionName: auto.promotionName ?? null,
                        loyaltyPointsRedeemed: actualPointsRedeemed,
                        loyaltyDiscountAmount,
                        tipAmount: bill.tipAmount,
                        totalAmount: bill.totalDue,
                    };
                if (!settlement.fullyPaid) {
                    await tx.order.update({
                        where: { id: orderId, status: 'OPEN' },
                        data: { ...lockedFigures, payments: { create: paymentRows } },
                    });
                    return;
                }
                const deduction = await this.inventory.deductForOrder(tx, branchId, userId, orderId, order.items.map((item) => ({
                    menuItemId: item.menuItemId,
                    quantity: item.quantity,
                })));
                stockSkipped = deduction.skipped;
                await this.releaseTableIfIdle(tx, order.tableId, orderId);
                if (effectiveCustomerId) {
                    const netSpend = (0, pricing_1.round2)(bill.subtotal - bill.discountAmount - loyaltyDiscountAmount);
                    const pointsEarned = Math.floor(netSpend / loyaltyEarnPerCurrency);
                    if (pointsEarned > 0) {
                        await tx.customer.update({
                            where: { id: effectiveCustomerId },
                            data: { loyaltyPoints: { increment: pointsEarned } },
                        });
                    }
                }
                await tx.order.update({
                    where: { id: orderId, status: 'OPEN' },
                    data: {
                        ...lockedFigures,
                        status: 'PAID',
                        billedAt: new Date(),
                        payments: { create: paymentRows },
                    },
                });
                await this.verifactu.recordPaidOrder(tx, orderId);
            });
        }
        catch (err) {
            if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (err.code === 'P2025') {
                    throw new common_1.ConflictException('This order was already checked out by another request.');
                }
                if (err.code === 'P2002' && dto.requestId) {
                    return this.checkoutResult(branchId, orderId);
                }
            }
            throw err;
        }
        const updated = await this.prisma.order.findUniqueOrThrow({
            where: { id: orderId },
            include: { payments: true, table: true },
        });
        if (stockSkipped.length > 0) {
            this.logger.warn(`Order ${updated.orderNumber}: no stock deducted for ${stockSkipped
                .map((s) => `${s.name} (${s.reason})`)
                .join(', ')}`);
            await this.audit.record({
                userId,
                action: 'inventory.deduction_skipped',
                entity: 'Order',
                entityId: orderId,
                metadata: { orderNumber: updated.orderNumber, items: stockSkipped },
            });
        }
        await this.audit.record({
            userId,
            action: settlement.fullyPaid
                ? 'order.paid'
                : 'order.partial_payment_recorded',
            entity: 'Order',
            entityId: orderId,
            metadata: {
                orderNumber: updated.orderNumber,
                amountDue: bill.totalDue,
                paidNow: settlement.paidNow,
                balanceAfter: settlement.balanceAfter,
                changeDue: settlement.changeDue,
                methods: settlement.payments.map((p) => `${p.method}:${p.amount}`),
            },
        });
        this.realtime.emitToBranch(branchId, 'order.updated', {
            id: updated.id,
            ...(settlement.fullyPaid
                ? { status: 'PAID' }
                : { balanceDue: settlement.balanceAfter }),
        });
        if (settlement.fullyPaid) {
            if (order.tableId) {
                this.realtime.emitToBranch(branchId, 'table.updated', {
                    id: order.tableId,
                });
            }
            void this.webhooks.emitForBranch(branchId, 'order.paid', {
                orderId: updated.id,
                orderNumber: updated.orderNumber,
                type: updated.type,
                total: Number(updated.totalAmount),
                tip: Number(updated.tipAmount),
                discount: Number(updated.discountAmount),
                couponCode: updated.couponCode,
                payments: updated.payments.map((p) => ({
                    method: p.method,
                    amount: Number(p.amount),
                })),
            });
        }
        return {
            ...updated,
            settlement: {
                amountDue: bill.totalDue,
                amountPaid: (0, pricing_1.round2)(paid + settlement.paidNow),
                balanceDue: settlement.balanceAfter,
                changeDue: settlement.changeDue,
                fullyPaid: settlement.fullyPaid,
            },
        };
    }
    async checkoutResult(branchId, orderId) {
        const updated = await this.prisma.order.findFirstOrThrow({
            where: { id: orderId, branchId },
            include: { payments: true, table: true },
        });
        const amountPaid = (0, pricing_1.round2)(updated.payments.reduce((sum, p) => sum + Number(p.amount), 0));
        const total = Number(updated.totalAmount);
        return {
            ...updated,
            settlement: {
                amountDue: total,
                amountPaid,
                balanceDue: updated.status === 'PAID'
                    ? 0
                    : Math.max((0, pricing_1.round2)(total - amountPaid), 0),
                changeDue: (0, pricing_1.round2)(updated.payments.reduce((sum, p) => sum + Number(p.changeGiven ?? 0), 0)),
                fullyPaid: updated.status === 'PAID',
            },
        };
    }
    async refund(branchId, orderId, userId, dto) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, branchId },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.status !== 'PAID') {
            throw new common_1.BadRequestException('Only a paid order can be refunded');
        }
        const refund = await this.prisma.$transaction(async (tx) => {
            await tx.order.update({
                where: { id: orderId },
                data: { updatedAt: new Date() },
            });
            const refunds = await tx.refund.findMany({ where: { orderId } });
            const alreadyRefunded = (0, pricing_1.round2)(refunds.reduce((sum, r) => sum + Number(r.amount), 0));
            const refundable = (0, pricing_1.round2)(Number(order.totalAmount) - alreadyRefunded);
            if (dto.amount > refundable) {
                throw new common_1.BadRequestException(`Cannot refund ${dto.amount} — only ${refundable} remains refundable on this order`);
            }
            const created = await tx.refund.create({
                data: {
                    orderId,
                    amount: dto.amount,
                    reason: dto.reason,
                    method: dto.method,
                    createdById: userId,
                },
            });
            await this.verifactu.recordRefund(tx, orderId, created.id, dto.amount);
            if (dto.returnedItems?.length) {
                const items = await tx.orderItem.findMany({
                    where: { orderId },
                    include: { stockReturns: true },
                });
                const byId = new Map(items.map((i) => [i.id, i]));
                const lines = [];
                for (const ret of dto.returnedItems) {
                    const item = byId.get(ret.orderItemId);
                    if (!item) {
                        throw new common_1.BadRequestException('Returned item does not belong to this order');
                    }
                    const alreadyReturned = item.stockReturns.reduce((sum, r) => sum + r.quantity, 0);
                    if (ret.quantity > item.quantity - alreadyReturned) {
                        throw new common_1.BadRequestException(`Cannot return ${ret.quantity} x ${item.nameSnapshot} — only ${item.quantity - alreadyReturned} left to return`);
                    }
                    await tx.orderItemStockReturn.create({
                        data: {
                            orderItemId: item.id,
                            refundId: created.id,
                            quantity: ret.quantity,
                        },
                    });
                    item.stockReturns.push({ quantity: ret.quantity });
                    lines.push({ menuItemId: item.menuItemId, quantity: ret.quantity });
                }
                await this.inventory.restoreForReturn(tx, branchId, userId, orderId, lines);
            }
            if (dto.method === 'STORE_CREDIT' && order.customerId) {
                await tx.customer.update({
                    where: { id: order.customerId },
                    data: { walletBalance: { increment: dto.amount } },
                });
            }
            return created;
        });
        this.realtime.emitToBranch(branchId, 'order.updated', { id: orderId });
        await this.audit.record({
            userId,
            action: 'order.refunded',
            entity: 'Order',
            entityId: orderId,
            metadata: {
                orderNumber: order.orderNumber,
                amount: dto.amount,
                method: dto.method,
                reason: dto.reason,
            },
        });
        return refund;
    }
    async mergeOrders(branchId, targetOrderId, sourceOrderId) {
        if (targetOrderId === sourceOrderId) {
            throw new common_1.BadRequestException('Cannot merge an order into itself');
        }
        const [target, source] = await Promise.all([
            this.prisma.order.findFirst({
                where: { id: targetOrderId, branchId },
                include: { payments: { select: { id: true } } },
            }),
            this.prisma.order.findFirst({
                where: { id: sourceOrderId, branchId },
                include: { payments: { select: { id: true } } },
            }),
        ]);
        if (!target || !source)
            throw new common_1.NotFoundException('Order not found');
        if (target.status !== 'OPEN' || source.status !== 'OPEN') {
            throw new common_1.BadRequestException('Both orders must be open to merge');
        }
        this.assertNoPayments(target);
        this.assertNoPayments(source);
        const updated = await this.prisma.$transaction(async (tx) => {
            await tx.orderItem.updateMany({
                where: { orderId: sourceOrderId },
                data: { orderId: targetOrderId },
            });
            await tx.kot.updateMany({
                where: { orderId: sourceOrderId },
                data: { orderId: targetOrderId },
            });
            const items = await tx.orderItem.findMany({
                where: { orderId: targetOrderId },
            });
            const lines = items.map((item) => (0, pricing_1.priceLine)({
                quantity: item.quantity,
                unitPriceInclusive: Number(item.lineTotal) / item.quantity,
                taxRatePercent: Number(item.taxRateSnapshot),
            }));
            const totals = (0, pricing_1.computeOrderTotals)(lines);
            const result = await tx.order.update({
                where: { id: targetOrderId },
                data: {
                    subtotal: totals.subtotal,
                    taxAmount: totals.taxAmount,
                    totalAmount: totals.subtotal,
                },
                include: { items: true },
            });
            await tx.order.update({
                where: { id: sourceOrderId },
                data: {
                    status: 'CANCELLED',
                    notes: `Merged into order ${target.orderNumber}`,
                },
            });
            if (source.tableId && source.tableId !== target.tableId) {
                await this.releaseTableIfIdle(tx, source.tableId, sourceOrderId);
            }
            return result;
        });
        this.realtime.emitToBranch(branchId, 'order.updated', {
            id: targetOrderId,
        });
        this.realtime.emitToBranch(branchId, 'order.updated', {
            id: sourceOrderId,
        });
        return this.getOrder(branchId, updated.id);
    }
    buildLine(cartItem, menuItemById, modifierById, taxMode, allowCustomPortion) {
        const menuItem = menuItemById.get(cartItem.menuItemId);
        if (!menuItem)
            throw new common_1.BadRequestException('Menu item not found');
        let portionBase = Number(menuItem.price);
        let portionSuffix = '';
        if (cartItem.portion === 'HALF' || cartItem.portion === 'FULL') {
            if (menuItem.halfPrice == null) {
                throw new common_1.BadRequestException(`${menuItem.name} has no half/full portions`);
            }
            if (cartItem.portion === 'HALF')
                portionBase = Number(menuItem.halfPrice);
            if (allowCustomPortion && cartItem.customPrice != null) {
                portionBase = cartItem.customPrice;
            }
            portionSuffix = cartItem.portion === 'HALF' ? ' (Half)' : ' (Full)';
        }
        else if (cartItem.portion === 'CUSTOM') {
            if (!allowCustomPortion) {
                throw new common_1.BadRequestException('Custom portions are staff-only');
            }
            if (cartItem.customPrice == null) {
                throw new common_1.BadRequestException('Custom portion needs a price');
            }
            portionBase = cartItem.customPrice;
            portionSuffix = ` (${cartItem.customLabel || 'Custom'})`;
        }
        const selectedModifiers = cartItem.modifierIds.map((id) => {
            const modifier = modifierById.get(id);
            if (!modifier)
                throw new common_1.BadRequestException('Modifier not found');
            return modifier;
        });
        const basePrice = portionBase;
        const modifierTotal = selectedModifiers.reduce((sum, m) => sum + Number(m.priceAdjustment), 0);
        const taxRatePercent = Number(menuItem.taxRatePercent);
        const unitPriceInclusive = (0, pricing_1.toEffectiveInclusiveUnitPrice)((0, pricing_1.round2)(basePrice + modifierTotal), taxRatePercent, taxMode);
        const priced = (0, pricing_1.priceLine)({
            quantity: cartItem.quantity,
            unitPriceInclusive,
            taxRatePercent,
        });
        return {
            cartItem,
            menuItem: {
                id: menuItem.id,
                name: menuItem.name + portionSuffix,
                price: unitPriceInclusive - (0, pricing_1.round2)(modifierTotal),
                taxRatePercent,
            },
            selectedModifiers,
            priced,
        };
    }
    async nextOrderNumber(branchId) {
        const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const latest = await this.prisma.order.findFirst({
            where: { branchId, orderNumber: { startsWith: `${datePart}-` } },
            orderBy: { orderNumber: 'desc' },
            select: { orderNumber: true },
        });
        const last = latest ? Number(latest.orderNumber.split('-')[1]) : 0;
        const next = (Number.isFinite(last) ? last : 0) + 1;
        return `${datePart}-${String(next).padStart(4, '0')}`;
    }
    async validateModifierSelections(branchId, items, enforceLimits) {
        if (!enforceLimits && items.every((i) => i.modifierIds.length === 0))
            return;
        const links = await this.prisma.menuItemModifierGroup.findMany({
            where: {
                menuItemId: { in: [...new Set(items.map((i) => i.menuItemId))] },
                modifierGroup: { branchId },
            },
            include: {
                modifierGroup: { include: { modifiers: { select: { id: true } } } },
            },
        });
        for (const item of items) {
            const groups = links
                .filter((l) => l.menuItemId === item.menuItemId)
                .map((l) => l.modifierGroup);
            const allowed = new Set(groups.flatMap((g) => g.modifiers.map((m) => m.id)));
            if (item.modifierIds.some((id) => !allowed.has(id))) {
                throw new common_1.BadRequestException('A selected option is not available for this item');
            }
            if (!enforceLimits)
                continue;
            for (const g of groups) {
                const picked = item.modifierIds.filter((id) => g.modifiers.some((m) => m.id === id)).length;
                const min = g.isRequired ? Math.max(1, g.minSelect) : g.minSelect;
                if (picked < min || picked > g.maxSelect) {
                    throw new common_1.BadRequestException(`Choose ${min === g.maxSelect ? min : `${min}–${g.maxSelect}`} option(s) for "${g.name}"`);
                }
            }
        }
    }
    isDeferred(scheduledFor) {
        return (!!scheduledFor &&
            scheduledFor.getTime() > Date.now() + OrdersService_1.SCHEDULE_LEAD_MS);
    }
    static SCHEDULE_LEAD_MS = 25 * 60_000;
    async releaseDueScheduledOrders() {
        const due = await this.prisma.order.findMany({
            where: {
                status: 'OPEN',
                acceptance: { in: ['NOT_REQUIRED', 'ACCEPTED'] },
                scheduledFor: {
                    lte: new Date(Date.now() + OrdersService_1.SCHEDULE_LEAD_MS),
                },
                kots: { none: {} },
            },
            include: { items: true },
        });
        for (const order of due) {
            await this.prisma.$transaction((tx) => this.generateKots(tx, order.id, order.branchId, order.items));
            this.realtime.emitToBranch(order.branchId, 'kot.updated', {
                orderId: order.id,
            });
            try {
                await this.notifications.notifyByPermission(order.branchId, 'kds.manage', {
                    type: 'order.new',
                    title: 'Scheduled order is due',
                    body: `Order ${order.orderNumber} (${order.type.replace('_', ' ')})`,
                    entity: 'Order',
                    entityId: order.id,
                });
            }
            catch (err) {
                this.logger.warn(`Failed to notify scheduled order ${order.id}: ${err instanceof Error ? err.message : String(err)}`);
            }
        }
        return due.length;
    }
    async generateKots(tx, orderId, branchId, orderItems) {
        const stationLookup = await tx.menuItem.findMany({
            where: { id: { in: orderItems.map((i) => i.menuItemId) } },
            select: { id: true, stationId: true },
        });
        const stationByMenuItem = new Map(stationLookup.map((m) => [m.id, m.stationId]));
        const itemsByStation = new Map();
        for (const item of orderItems) {
            const stationId = stationByMenuItem.get(item.menuItemId) ?? null;
            const bucket = itemsByStation.get(stationId) ?? [];
            bucket.push(item);
            itemsByStation.set(stationId, bucket);
        }
        let ticketSeq = (await tx.kot.count({ where: { orderId } })) + 1;
        for (const [stationId, items] of itemsByStation) {
            const kot = await tx.kot.create({
                data: {
                    orderId,
                    stationId: stationId ?? undefined,
                    ticketNumber: `${orderId.slice(-6)}-${ticketSeq++}`,
                    items: { create: items.map((item) => ({ orderItemId: item.id })) },
                },
            });
            this.realtime.emitToBranch(branchId, 'kot.created', {
                id: kot.id,
                stationId,
            });
        }
    }
    async updateKotStatus(branchId, kotId, status, userId) {
        if (!KOT_FORWARD_STATUSES.includes(status)) {
            throw new common_1.BadRequestException('A ticket can only move to accepted, preparing, ready or served - use reject to decline it');
        }
        const target = status;
        const kot = await this.prisma.kot.findFirst({
            where: { id: kotId, order: { branchId } },
            include: {
                order: {
                    select: {
                        id: true,
                        orderNumber: true,
                        table: { select: { assignedWaiterId: true, number: true } },
                    },
                },
            },
        });
        if (!kot)
            throw new common_1.NotFoundException('KOT not found');
        if (kot.status === target)
            return kot;
        if (!(0, types_1.canTransitionKot)(kot.status, target)) {
            throw new common_1.ConflictException(`This ticket is ${kot.status.toLowerCase()} - it cannot move to ${target.toLowerCase()}. Refresh to see its current state.`);
        }
        const now = new Date();
        const stamps = {};
        if (target === 'ACCEPTED')
            stamps.acceptedAt = now;
        if (target === 'READY')
            stamps.readyAt = now;
        if (target === 'SERVED')
            stamps.servedAt = now;
        const updated = await this.prisma.$transaction(async (tx) => {
            const moved = await tx.kot.updateMany({
                where: { id: kotId, status: kot.status },
                data: {
                    status: target,
                    ...stamps,
                    ...(target === 'ACCEPTED' && userId ? { acceptedById: userId } : {}),
                },
            });
            if (moved.count === 0) {
                throw new common_1.ConflictException('This ticket was just updated by someone else - refresh to see its current state');
            }
            await tx.kotItem.updateMany({
                where: { kotId },
                data: { status: target },
            });
            return tx.kot.findUniqueOrThrow({ where: { id: kotId } });
        });
        this.realtime.emitToBranch(branchId, 'kot.updated', updated);
        this.realtime.emitToBranch(branchId, 'order.updated', {
            id: kot.order.id,
        });
        await this.audit.record({
            userId,
            action: 'kot.status_changed',
            entity: 'Kot',
            entityId: kotId,
            metadata: {
                orderNumber: kot.order.orderNumber,
                ticketNumber: kot.ticketNumber,
                from: kot.status,
                to: target,
            },
        });
        const assignedWaiterId = kot.order.table?.assignedWaiterId;
        if (target === 'READY' && assignedWaiterId) {
            try {
                await this.notifications.notifyUser(assignedWaiterId, branchId, {
                    type: 'order.ready',
                    title: 'Order ready',
                    body: kot.order.table
                        ? `Order ${kot.order.orderNumber} — Table ${kot.order.table.number} is ready to serve`
                        : `Order ${kot.order.orderNumber} is ready to serve`,
                    entity: 'Order',
                    entityId: kot.order.id,
                });
            }
            catch (err) {
                this.logger.warn(`Failed to send order.ready notification for order ${kot.order.id}: ${err instanceof Error ? err.message : String(err)}`);
            }
        }
        return updated;
    }
    async rejectKot(branchId, kotId, userId, input) {
        const reason = input.reason.trim();
        if (!reason)
            throw new common_1.BadRequestException('A reason is required');
        const kot = await this.prisma.kot.findFirst({
            where: { id: kotId, order: { branchId } },
            include: {
                items: { include: { orderItem: true } },
                order: { include: { kots: true, payments: true } },
            },
        });
        if (!kot)
            throw new common_1.NotFoundException('KOT not found');
        const current = kot.status;
        if (current === 'REJECTED')
            return kot;
        if (!(0, types_1.canTransitionKot)(current, 'REJECTED')) {
            throw new common_1.ConflictException(`This ticket is ${current.toLowerCase()} - it can no longer be rejected`);
        }
        const started = types_1.KOT_STARTED_STATUSES.includes(current);
        if (started) {
            if (!input.mayRejectStarted) {
                throw new common_1.ForbiddenException('The kitchen has already started this ticket - only a manager can reject it');
            }
            if (!input.confirmStarted) {
                throw new common_1.ConflictException({
                    statusCode: 409,
                    code: 'KITCHEN_STARTED',
                    message: 'This ticket is already being prepared. Confirm to reject it anyway - the food in progress will be wasted.',
                });
            }
        }
        const order = kot.order;
        if (order.status !== 'OPEN') {
            throw new common_1.ConflictException('This order is no longer open');
        }
        if (order.payments.length > 0) {
            throw new common_1.BadRequestException('This order already has a payment - refund it instead of rejecting a ticket');
        }
        const otherLive = order.kots.some((k) => k.id !== kotId && !['CANCELLED', 'REJECTED'].includes(k.status));
        const lineIds = kot.items.map((i) => i.orderItemId);
        const rejectedLines = kot.items.map((i) => ({
            item: i.orderItem.nameSnapshot,
            quantity: i.orderItem.quantity,
            lineTotal: i.orderItem.lineTotal.toString(),
        }));
        await this.prisma.$transaction(async (tx) => {
            const moved = await tx.kot.updateMany({
                where: { id: kotId, status: kot.status },
                data: {
                    status: 'REJECTED',
                    rejectedAt: new Date(),
                    rejectedById: userId,
                    rejectReason: reason,
                },
            });
            if (moved.count === 0) {
                throw new common_1.ConflictException('This ticket was just updated by someone else - refresh to see its current state');
            }
            await tx.kotItem.updateMany({
                where: { kotId },
                data: { status: 'CANCELLED' },
            });
            if (!otherLive) {
                const flipped = await tx.order.updateMany({
                    where: { id: order.id, status: 'OPEN' },
                    data: {
                        status: 'CANCELLED',
                        cancelReason: reason,
                        cancelledAt: new Date(),
                        cancelledById: userId,
                        cancelSource: 'KITCHEN_REJECTED',
                    },
                });
                if (flipped.count === 0) {
                    throw new common_1.ConflictException('This order was just paid or changed - refresh and check it');
                }
                await this.releaseTableIfIdle(tx, order.tableId, order.id);
                return;
            }
            if (lineIds.length > 0) {
                await tx.orderItem.deleteMany({ where: { id: { in: lineIds } } });
                await this.recomputeTotals(tx, order.id);
            }
        });
        this.realtime.emitToBranch(branchId, 'kot.updated', {
            id: kotId,
            orderId: order.id,
            status: 'REJECTED',
        });
        this.emitOrderWithdrawn(branchId, order.id, otherLive ? null : order.tableId);
        if (otherLive) {
            this.realtime.emitToBranch(branchId, 'order.updated', { id: order.id });
        }
        await this.audit.record({
            userId,
            action: 'kot.rejected',
            entity: 'Kot',
            entityId: kotId,
            metadata: {
                orderNumber: order.orderNumber,
                ticketNumber: kot.ticketNumber,
                from: current,
                reason,
                wholeOrderCancelled: !otherLive,
                kitchenStarted: started,
                lines: rejectedLines,
            },
        });
        try {
            await this.notifications.notifyByPermission(branchId, 'orders.create', {
                type: 'order.rejected',
                title: 'Kitchen rejected a ticket',
                body: `Order ${order.orderNumber}: ${reason}`,
                entity: 'Order',
                entityId: order.id,
            });
        }
        catch (err) {
            this.logger.warn(`Failed to notify staff of rejected ticket ${kotId}: ${err instanceof Error ? err.message : String(err)}`);
        }
        return this.prisma.kot.findUniqueOrThrow({ where: { id: kotId } });
    }
    async setKotPriority(branchId, kotId, isPriority) {
        const kot = await this.prisma.kot.findFirst({
            where: { id: kotId, order: { branchId } },
        });
        if (!kot)
            throw new common_1.NotFoundException('KOT not found');
        const updated = await this.prisma.kot.update({
            where: { id: kotId },
            data: { isPriority },
        });
        this.realtime.emitToBranch(branchId, 'kot.updated', updated);
        return updated;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        realtime_gateway_1.RealtimeGateway,
        gift_cards_service_1.GiftCardsService,
        inventory_service_1.InventoryService,
        audit_service_1.AuditService,
        notifications_service_1.NotificationsService,
        marketing_service_1.MarketingService,
        webhooks_service_1.WebhooksService,
        verifactu_service_1.VerifactuService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map