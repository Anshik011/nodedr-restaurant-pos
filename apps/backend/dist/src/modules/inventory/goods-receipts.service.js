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
exports.GoodsReceiptsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const money_1 = require("../../common/money");
let GoodsReceiptsService = class GoodsReceiptsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    listGoodsReceipts(branchId) {
        return this.prisma.goodsReceipt.findMany({
            where: { branchId },
            include: {
                supplier: { select: { id: true, name: true } },
                items: true,
                receivedBy: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getGoodsReceipt(branchId, id) {
        const grn = await this.prisma.goodsReceipt.findFirst({
            where: { id, branchId },
            include: {
                supplier: true,
                purchaseOrder: { select: { id: true, poNumber: true } },
                receivedBy: { select: { id: true, name: true } },
                items: { include: { ingredient: true, stockBatch: true } },
            },
        });
        if (!grn)
            throw new common_1.NotFoundException('Goods receipt not found');
        return grn;
    }
    async createGoodsReceipt(branchId, userId, dto) {
        const supplier = await this.prisma.supplier.findFirst({
            where: { id: dto.supplierId, branchId },
        });
        if (!supplier)
            throw new common_1.BadRequestException('Supplier not found in this branch');
        let purchaseOrder = null;
        if (dto.purchaseOrderId) {
            purchaseOrder = await this.prisma.purchaseOrder.findFirst({
                where: { id: dto.purchaseOrderId, branchId },
                include: { items: true },
            });
            if (!purchaseOrder)
                throw new common_1.BadRequestException('Purchase order not found in this branch');
            if (purchaseOrder.status === 'CANCELLED' ||
                purchaseOrder.status === 'RECEIVED') {
                throw new common_1.BadRequestException(`Cannot receive against a purchase order that is already ${purchaseOrder.status}`);
            }
        }
        const ingredientIds = dto.items.map((i) => i.ingredientId);
        const ingredients = await this.prisma.ingredient.findMany({
            where: { id: { in: ingredientIds }, branchId },
        });
        if (ingredients.length !== new Set(ingredientIds).size) {
            throw new common_1.BadRequestException('One or more ingredients not found in this branch');
        }
        if (purchaseOrder) {
            for (const item of dto.items) {
                if (!item.purchaseOrderItemId)
                    continue;
                const poItem = purchaseOrder.items.find((pi) => pi.id === item.purchaseOrderItemId);
                if (!poItem || poItem.ingredientId !== item.ingredientId) {
                    throw new common_1.BadRequestException('purchaseOrderItemId does not match this purchase order / ingredient');
                }
            }
        }
        const grnNumber = await this.nextGrnNumber(branchId);
        return this.prisma.$transaction(async (tx) => {
            const grn = await tx.goodsReceipt.create({
                data: {
                    branchId,
                    supplierId: dto.supplierId,
                    purchaseOrderId: dto.purchaseOrderId,
                    grnNumber,
                    notes: dto.notes,
                    receivedById: userId,
                },
            });
            const receivedByPoItem = new Map();
            for (const [index, item] of dto.items.entries()) {
                const ingredient = ingredients.find((i) => i.id === item.ingredientId);
                const batchNumber = item.batchNumber || `${grnNumber}-${index + 1}`;
                const grnItem = await tx.goodsReceiptItem.create({
                    data: {
                        goodsReceiptId: grn.id,
                        ingredientId: item.ingredientId,
                        purchaseOrderItemId: item.purchaseOrderItemId,
                        quantity: item.quantity,
                        unitCost: item.unitCost,
                        batchNumber,
                        expiryDate: item.expiryDate,
                    },
                });
                const batch = await tx.stockBatch.create({
                    data: {
                        branchId,
                        ingredientId: item.ingredientId,
                        goodsReceiptItemId: grnItem.id,
                        batchNumber,
                        quantityReceived: item.quantity,
                        quantityRemaining: item.quantity,
                        unitCost: item.unitCost,
                        expiryDate: item.expiryDate,
                    },
                });
                await tx.stockMovement.create({
                    data: {
                        branchId,
                        ingredientId: item.ingredientId,
                        batchId: batch.id,
                        type: 'RECEIPT',
                        quantity: item.quantity,
                        note: `GRN ${grnNumber}`,
                        createdById: userId,
                    },
                });
                const oldStock = Math.max(0, Number(ingredient.currentStock));
                const oldCost = Number(ingredient.costPerUnit);
                const newStock = (0, money_1.round3)(oldStock + item.quantity);
                const newCost = newStock > 0
                    ? (0, money_1.round4)((oldStock * oldCost + item.quantity * item.unitCost) / newStock)
                    : oldCost;
                await tx.ingredient.update({
                    where: { id: item.ingredientId },
                    data: { currentStock: newStock, costPerUnit: newCost },
                });
                ingredient.currentStock =
                    newStock;
                ingredient.costPerUnit =
                    newCost;
                if (item.purchaseOrderItemId) {
                    receivedByPoItem.set(item.purchaseOrderItemId, (receivedByPoItem.get(item.purchaseOrderItemId) ?? 0) +
                        item.quantity);
                }
            }
            for (const [poItemId, addedQty] of receivedByPoItem) {
                const poItem = purchaseOrder.items.find((pi) => pi.id === poItemId);
                await tx.purchaseOrderItem.update({
                    where: { id: poItemId },
                    data: {
                        quantityReceived: (0, money_1.round3)(Number(poItem.quantityReceived) + addedQty),
                    },
                });
            }
            if (purchaseOrder) {
                const items = await tx.purchaseOrderItem.findMany({
                    where: { purchaseOrderId: purchaseOrder.id },
                });
                const fullyReceived = items.every((i) => Number(i.quantityReceived) >= Number(i.quantityOrdered));
                const anyReceived = items.some((i) => Number(i.quantityReceived) > 0);
                await tx.purchaseOrder.update({
                    where: { id: purchaseOrder.id },
                    data: {
                        status: fullyReceived
                            ? 'RECEIVED'
                            : anyReceived
                                ? 'PARTIALLY_RECEIVED'
                                : purchaseOrder.status,
                    },
                });
            }
            return tx.goodsReceipt.findUniqueOrThrow({
                where: { id: grn.id },
                include: { items: { include: { ingredient: true, stockBatch: true } } },
            });
        });
    }
    async nextGrnNumber(branchId) {
        const count = await this.prisma.goodsReceipt.count({ where: { branchId } });
        return `GRN-${String(count + 1).padStart(4, '0')}`;
    }
};
exports.GoodsReceiptsService = GoodsReceiptsService;
exports.GoodsReceiptsService = GoodsReceiptsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GoodsReceiptsService);
//# sourceMappingURL=goods-receipts.service.js.map