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
exports.TransfersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const money_1 = require("../../common/money");
const stock_service_1 = require("./stock.service");
let TransfersService = class TransfersService {
    prisma;
    stock;
    constructor(prisma, stock) {
        this.prisma = prisma;
        this.stock = stock;
    }
    list(restaurantId, branchId) {
        return this.prisma.stockTransfer.findMany({
            where: {
                restaurantId,
                OR: [{ fromBranchId: branchId }, { toBranchId: branchId }],
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
    otherBranches(restaurantId, branchId) {
        return this.prisma.branch.findMany({
            where: { restaurantId, isActive: true, NOT: { id: branchId } },
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
        });
    }
    async transfer(restaurantId, userId, fromBranchId, dto) {
        if (dto.toBranchId === fromBranchId)
            throw new common_1.BadRequestException('Pick a different destination branch');
        const [from, to] = await Promise.all([
            this.prisma.branch.findFirst({
                where: { id: fromBranchId, restaurantId },
                select: { id: true, name: true },
            }),
            this.prisma.branch.findFirst({
                where: { id: dto.toBranchId, restaurantId, isActive: true },
                select: { id: true, name: true },
            }),
        ]);
        if (!from || !to)
            throw new common_1.BadRequestException('Both branches must belong to this restaurant');
        const source = await this.prisma.ingredient.findFirst({
            where: { id: dto.ingredientId, branchId: fromBranchId },
        });
        if (!source)
            throw new common_1.BadRequestException('Ingredient not found in this branch');
        return this.prisma.$transaction(async (tx) => {
            const portions = await this.stock.consumeStock(tx, fromBranchId, source.id, dto.quantity, {
                type: 'ADJUSTMENT',
                note: `Transfer out to ${to.name}`,
                userId,
            });
            const totalCost = portions.reduce((s, p) => s + p.quantity * p.unitCost, 0);
            const unitCost = (0, money_1.round4)(totalCost / dto.quantity);
            const dest = (await tx.ingredient.findFirst({
                where: { branchId: to.id, name: source.name },
            })) ??
                (await tx.ingredient.create({
                    data: {
                        branchId: to.id,
                        name: source.name,
                        sku: source.sku,
                        unit: source.unit,
                        reorderLevel: source.reorderLevel,
                    },
                }));
            if (dest.unit !== source.unit)
                throw new common_1.BadRequestException(`${to.name} stocks ${source.name} in ${dest.unit}, not ${source.unit}`);
            await tx.$queryRaw `SELECT id FROM ingredients WHERE id = ${dest.id} FOR UPDATE`;
            const fresh = await tx.ingredient.findUniqueOrThrow({
                where: { id: dest.id },
            });
            const batch = await tx.stockBatch.create({
                data: {
                    branchId: to.id,
                    ingredientId: dest.id,
                    batchNumber: `TRF-${Date.now().toString(36).toUpperCase()}`,
                    quantityReceived: dto.quantity,
                    quantityRemaining: dto.quantity,
                    unitCost,
                },
            });
            await tx.stockMovement.create({
                data: {
                    branchId: to.id,
                    ingredientId: dest.id,
                    batchId: batch.id,
                    type: 'RECEIPT',
                    quantity: dto.quantity,
                    note: `Transfer in from ${from.name}`,
                    createdById: userId,
                },
            });
            const oldQty = Math.max(0, Number(fresh.currentStock));
            const newQty = (0, money_1.round3)(oldQty + dto.quantity);
            const avg = (0, money_1.round4)((oldQty * Number(fresh.costPerUnit) + dto.quantity * unitCost) / newQty);
            await tx.ingredient.update({
                where: { id: dest.id },
                data: {
                    currentStock: (0, money_1.round3)(Number(fresh.currentStock) + dto.quantity),
                    costPerUnit: avg,
                },
            });
            return tx.stockTransfer.create({
                data: {
                    restaurantId,
                    fromBranchId,
                    toBranchId: to.id,
                    fromBranchName: from.name,
                    toBranchName: to.name,
                    ingredientName: source.name,
                    unit: source.unit,
                    quantity: dto.quantity,
                    unitCost,
                    note: dto.note,
                    createdById: userId,
                },
            });
        });
    }
};
exports.TransfersService = TransfersService;
exports.TransfersService = TransfersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        stock_service_1.StockService])
], TransfersService);
//# sourceMappingURL=transfers.service.js.map