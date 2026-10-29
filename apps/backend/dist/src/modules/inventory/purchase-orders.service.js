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
exports.PurchaseOrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const money_1 = require("../../common/money");
const NEXT_STATUS = {
    DRAFT: ['SENT', 'CANCELLED'],
    SENT: ['CANCELLED'],
    PARTIALLY_RECEIVED: [],
    RECEIVED: [],
    CANCELLED: [],
};
let PurchaseOrdersService = class PurchaseOrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    listPurchaseOrders(branchId, status) {
        return this.prisma.purchaseOrder.findMany({
            where: { branchId, ...(status ? { status } : {}) },
            include: {
                supplier: { select: { id: true, name: true } },
                items: true,
                createdBy: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getPurchaseOrder(branchId, id) {
        const po = await this.prisma.purchaseOrder.findFirst({
            where: { id, branchId },
            include: {
                supplier: true,
                createdBy: { select: { id: true, name: true } },
                items: { include: { ingredient: true } },
                goodsReceipts: {
                    include: {
                        items: true,
                        receivedBy: { select: { id: true, name: true } },
                    },
                },
            },
        });
        if (!po)
            throw new common_1.NotFoundException('Purchase order not found');
        return po;
    }
    async createPurchaseOrder(branchId, userId, dto) {
        const supplier = await this.prisma.supplier.findFirst({
            where: { id: dto.supplierId, branchId },
        });
        if (!supplier)
            throw new common_1.BadRequestException('Supplier not found in this branch');
        const ingredientIds = dto.items.map((i) => i.ingredientId);
        const ingredientCount = await this.prisma.ingredient.count({
            where: { id: { in: ingredientIds }, branchId },
        });
        if (ingredientCount !== new Set(ingredientIds).size) {
            throw new common_1.BadRequestException('One or more ingredients not found in this branch');
        }
        const totalAmount = (0, money_1.round2)(dto.items.reduce((sum, i) => sum + i.quantityOrdered * i.unitCost, 0));
        const poNumber = await this.nextPoNumber(branchId);
        return this.prisma.purchaseOrder.create({
            data: {
                branchId,
                supplierId: dto.supplierId,
                poNumber,
                expectedDate: dto.expectedDate,
                notes: dto.notes,
                totalAmount,
                createdById: userId,
                items: {
                    create: dto.items.map((i) => ({
                        ingredientId: i.ingredientId,
                        quantityOrdered: i.quantityOrdered,
                        unitCost: i.unitCost,
                    })),
                },
            },
            include: { items: true },
        });
    }
    async updateStatus(branchId, id, status) {
        const po = await this.getPurchaseOrder(branchId, id);
        const allowed = NEXT_STATUS[po.status];
        if (!allowed.includes(status)) {
            throw new common_1.BadRequestException(`Cannot move purchase order from ${po.status} to ${status}`);
        }
        return this.prisma.purchaseOrder.update({
            where: { id },
            data: { status },
        });
    }
    async nextPoNumber(branchId) {
        const count = await this.prisma.purchaseOrder.count({
            where: { branchId },
        });
        return `PO-${String(count + 1).padStart(4, '0')}`;
    }
};
exports.PurchaseOrdersService = PurchaseOrdersService;
exports.PurchaseOrdersService = PurchaseOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PurchaseOrdersService);
//# sourceMappingURL=purchase-orders.service.js.map