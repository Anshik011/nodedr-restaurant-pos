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
exports.StockService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const money_1 = require("../../common/money");
let StockService = class StockService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    listMovements(branchId, ingredientId) {
        return this.prisma.stockMovement.findMany({
            where: { branchId, ingredientId },
            include: { createdBy: { select: { id: true, name: true } }, batch: true },
            orderBy: { createdAt: 'desc' },
            take: 200,
        });
    }
    listBatches(branchId, ingredientId) {
        return this.prisma.stockBatch.findMany({
            where: { branchId, ingredientId },
            orderBy: { receivedAt: 'desc' },
        });
    }
    async consumeStock(tx, branchId, ingredientId, quantity, opts) {
        const ingredient = await tx.ingredient.findFirst({
            where: { id: ingredientId, branchId },
        });
        if (!ingredient)
            throw new common_1.NotFoundException('Ingredient not found');
        await tx.$queryRaw `SELECT id FROM ingredients WHERE id = ${ingredientId} FOR UPDATE`;
        const batches = await tx.stockBatch.findMany({
            where: { branchId, ingredientId, quantityRemaining: { gt: 0 } },
            orderBy: { receivedAt: 'asc' },
        });
        const availableFromBatches = batches.reduce((sum, b) => sum + Number(b.quantityRemaining), 0);
        const available = batches.length > 0
            ? availableFromBatches
            : Number(ingredient.currentStock);
        if (quantity > available && !opts.allowNegative) {
            throw new common_1.BadRequestException(`Cannot consume ${quantity} ${ingredient.unit} of ${ingredient.name} — only ${available} in stock`);
        }
        const portions = [];
        let remaining = quantity;
        for (const batch of batches) {
            if (remaining <= 0)
                break;
            const consumeQty = Math.min(remaining, Number(batch.quantityRemaining));
            await tx.stockBatch.update({
                where: { id: batch.id },
                data: {
                    quantityRemaining: (0, money_1.round3)(Number(batch.quantityRemaining) - consumeQty),
                },
            });
            await tx.stockMovement.create({
                data: {
                    branchId,
                    ingredientId,
                    batchId: batch.id,
                    type: opts.type,
                    quantity: -consumeQty,
                    note: opts.note,
                    createdById: opts.userId,
                    orderId: opts.orderId,
                },
            });
            portions.push({
                batchId: batch.id,
                quantity: consumeQty,
                unitCost: Number(batch.unitCost),
            });
            remaining = (0, money_1.round3)(remaining - consumeQty);
        }
        if (remaining > 0) {
            await tx.stockMovement.create({
                data: {
                    branchId,
                    ingredientId,
                    type: opts.type,
                    quantity: -remaining,
                    note: opts.note,
                    createdById: opts.userId,
                    orderId: opts.orderId,
                },
            });
            portions.push({
                batchId: null,
                quantity: remaining,
                unitCost: Number(ingredient.costPerUnit),
            });
        }
        await tx.ingredient.update({
            where: { id: ingredientId },
            data: {
                currentStock: (0, money_1.round3)(Number(ingredient.currentStock) - quantity),
            },
        });
        return portions;
    }
    async restoreStock(tx, branchId, ingredientId, quantity, opts) {
        await tx.$queryRaw `SELECT id FROM ingredients WHERE id = ${ingredientId} FOR UPDATE`;
        const ingredient = await tx.ingredient.findFirst({
            where: { id: ingredientId, branchId },
        });
        if (!ingredient)
            throw new common_1.NotFoundException('Ingredient not found');
        const moves = await tx.stockMovement.findMany({
            where: { orderId: opts.orderId, ingredientId },
            orderBy: { createdAt: 'asc' },
        });
        const consumed = moves
            .filter((m) => m.type === 'CONSUMPTION')
            .reduce((sum, m) => sum + -Number(m.quantity), 0);
        const reversed = moves
            .filter((m) => m.type === 'REVERSAL')
            .reduce((sum, m) => sum + Number(m.quantity), 0);
        let remaining = (0, money_1.round3)(Math.min(quantity, consumed - reversed));
        if (remaining <= 0)
            return 0;
        const restored = remaining;
        const room = new Map();
        for (const m of moves) {
            const key = m.batchId;
            if (m.type === 'CONSUMPTION') {
                room.set(key, (0, money_1.round3)((room.get(key) ?? 0) + -Number(m.quantity)));
            }
            else if (m.type === 'REVERSAL') {
                room.set(key, (0, money_1.round3)((room.get(key) ?? 0) - Number(m.quantity)));
            }
        }
        for (const [batchId, available] of [...room.entries()].reverse()) {
            if (remaining <= 0)
                break;
            const back = Math.min(remaining, available);
            if (back <= 0)
                continue;
            if (batchId) {
                const batch = await tx.stockBatch.findUnique({
                    where: { id: batchId },
                });
                if (batch) {
                    await tx.stockBatch.update({
                        where: { id: batch.id },
                        data: {
                            quantityRemaining: (0, money_1.round3)(Number(batch.quantityRemaining) + back),
                        },
                    });
                }
            }
            await tx.stockMovement.create({
                data: {
                    branchId,
                    ingredientId,
                    batchId,
                    type: 'REVERSAL',
                    quantity: back,
                    note: opts.note,
                    createdById: opts.userId,
                    orderId: opts.orderId,
                },
            });
            remaining = (0, money_1.round3)(remaining - back);
        }
        await tx.ingredient.update({
            where: { id: ingredientId },
            data: {
                currentStock: (0, money_1.round3)(Number(ingredient.currentStock) + restored),
            },
        });
        return restored;
    }
    async adjustStock(branchId, userId, ingredientId, dto) {
        return this.prisma.$transaction(async (tx) => {
            const ingredient = await tx.ingredient.findFirst({
                where: { id: ingredientId, branchId },
            });
            if (!ingredient)
                throw new common_1.NotFoundException('Ingredient not found');
            const newStock = (0, money_1.round3)(Number(ingredient.currentStock) + dto.quantity);
            if (newStock < 0) {
                throw new common_1.BadRequestException('Adjustment would take stock below zero');
            }
            await tx.ingredient.update({
                where: { id: ingredientId },
                data: { currentStock: newStock },
            });
            return tx.stockMovement.create({
                data: {
                    branchId,
                    ingredientId,
                    type: 'ADJUSTMENT',
                    quantity: dto.quantity,
                    note: dto.note,
                    createdById: userId,
                },
            });
        });
    }
};
exports.StockService = StockService;
exports.StockService = StockService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StockService);
//# sourceMappingURL=stock.service.js.map