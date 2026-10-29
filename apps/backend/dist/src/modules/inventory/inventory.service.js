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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const money_1 = require("../../common/money");
const stock_service_1 = require("./stock.service");
const stock_plan_1 = require("./stock-plan");
let InventoryService = class InventoryService {
    prisma;
    stockService;
    constructor(prisma, stockService) {
        this.prisma = prisma;
        this.stockService = stockService;
    }
    listIngredients(branchId) {
        return this.prisma.ingredient.findMany({
            where: { branchId },
            orderBy: { name: 'asc' },
        });
    }
    async getIngredient(branchId, id) {
        const ingredient = await this.prisma.ingredient.findFirst({
            where: { id, branchId },
        });
        if (!ingredient)
            throw new common_1.NotFoundException('Ingredient not found');
        return ingredient;
    }
    createIngredient(branchId, dto) {
        return this.prisma.ingredient.create({ data: { ...dto, branchId } });
    }
    async updateIngredient(branchId, id, dto) {
        await this.getIngredient(branchId, id);
        return this.prisma.ingredient.update({ where: { id }, data: dto });
    }
    async deleteIngredient(branchId, id) {
        await this.getIngredient(branchId, id);
        const usedInRecipe = await this.prisma.recipeIngredient.count({
            where: { ingredientId: id },
        });
        if (usedInRecipe > 0) {
            throw new common_1.BadRequestException('Ingredient is used in a menu item recipe — remove it from every recipe first');
        }
        await this.prisma.ingredient.delete({ where: { id } });
        return { ok: true };
    }
    async lowStockIngredients(branchId) {
        const ingredients = await this.listIngredients(branchId);
        return ingredients.filter((i) => Number(i.currentStock) <= Number(i.reorderLevel));
    }
    listSuppliers(branchId) {
        return this.prisma.supplier.findMany({
            where: { branchId },
            orderBy: { name: 'asc' },
        });
    }
    async getSupplier(branchId, id) {
        const supplier = await this.prisma.supplier.findFirst({
            where: { id, branchId },
        });
        if (!supplier)
            throw new common_1.NotFoundException('Supplier not found');
        return supplier;
    }
    createSupplier(branchId, dto) {
        return this.prisma.supplier.create({ data: { ...dto, branchId } });
    }
    async updateSupplier(branchId, id, dto) {
        await this.getSupplier(branchId, id);
        return this.prisma.supplier.update({ where: { id }, data: dto });
    }
    async deleteSupplier(branchId, id) {
        await this.getSupplier(branchId, id);
        const usedInPo = await this.prisma.purchaseOrder.count({
            where: { supplierId: id },
        });
        if (usedInPo > 0) {
            throw new common_1.BadRequestException('Supplier has purchase orders on record — deactivate instead of deleting');
        }
        await this.prisma.supplier.delete({ where: { id } });
        return { ok: true };
    }
    async getRecipe(branchId, menuItemId) {
        await this.assertMenuItemInBranch(branchId, menuItemId);
        const lines = await this.prisma.recipeIngredient.findMany({
            where: { menuItemId },
            include: { ingredient: true },
            orderBy: { createdAt: 'asc' },
        });
        const costed = lines.map((line) => ({
            id: line.id,
            ingredientId: line.ingredientId,
            ingredientName: line.ingredient.name,
            unit: line.ingredient.unit,
            quantity: Number(line.quantity),
            costPerUnit: Number(line.ingredient.costPerUnit),
            lineCost: (0, money_1.round2)(Number(line.quantity) * Number(line.ingredient.costPerUnit)),
        }));
        const totalCost = (0, money_1.round2)(costed.reduce((sum, l) => sum + l.lineCost, 0));
        return { lines: costed, totalCost };
    }
    async setRecipe(branchId, menuItemId, lines) {
        await this.assertMenuItemInBranch(branchId, menuItemId);
        const ingredientIds = lines.map((l) => l.ingredientId);
        if (new Set(ingredientIds).size !== ingredientIds.length) {
            throw new common_1.BadRequestException('Duplicate ingredient in recipe');
        }
        if (ingredientIds.length > 0) {
            const count = await this.prisma.ingredient.count({
                where: { id: { in: ingredientIds }, branchId },
            });
            if (count !== ingredientIds.length) {
                throw new common_1.BadRequestException('One or more ingredients not found in this branch');
            }
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.recipeIngredient.deleteMany({ where: { menuItemId } });
            if (lines.length > 0) {
                await tx.recipeIngredient.createMany({
                    data: lines.map((l) => ({
                        menuItemId,
                        ingredientId: l.ingredientId,
                        quantity: l.quantity,
                    })),
                });
            }
        });
        const recipe = await this.getRecipe(branchId, menuItemId);
        await this.prisma.menuItem.update({
            where: { id: menuItemId },
            data: { costPrice: recipe.totalCost },
        });
        if (lines.length > 0) {
            await this.prisma.menuItem.updateMany({
                where: { id: menuItemId, inventoryTracking: 'NONE' },
                data: { inventoryTracking: 'RECIPE' },
            });
        }
        return recipe;
    }
    async getTracking(branchId, menuItemId) {
        const item = await this.prisma.menuItem.findFirst({
            where: { id: menuItemId, branchId },
            select: {
                id: true,
                inventoryTracking: true,
                stockIngredientId: true,
                stockQuantityPerSale: true,
                isCombo: true,
            },
        });
        if (!item)
            throw new common_1.NotFoundException('Menu item not found');
        return {
            ...item,
            stockQuantityPerSale: Number(item.stockQuantityPerSale),
        };
    }
    async setTracking(branchId, menuItemId, dto) {
        await this.assertMenuItemInBranch(branchId, menuItemId);
        if (dto.inventoryTracking === 'DIRECT') {
            const ingredient = await this.prisma.ingredient.findFirst({
                where: { id: dto.stockIngredientId ?? '', branchId },
                select: { id: true },
            });
            if (!ingredient) {
                throw new common_1.BadRequestException('Stock item not found in this branch');
            }
        }
        await this.prisma.menuItem.update({
            where: { id: menuItemId },
            data: {
                inventoryTracking: dto.inventoryTracking,
                stockIngredientId: dto.inventoryTracking === 'DIRECT' ? dto.stockIngredientId : null,
                stockQuantityPerSale: dto.inventoryTracking === 'DIRECT'
                    ? (dto.stockQuantityPerSale ?? 1)
                    : 1,
            },
        });
        return this.getTracking(branchId, menuItemId);
    }
    async assertMenuItemInBranch(branchId, menuItemId) {
        const item = await this.prisma.menuItem.findFirst({
            where: { id: menuItemId, branchId },
            select: { id: true },
        });
        if (!item)
            throw new common_1.NotFoundException('Menu item not found');
    }
    async deductForOrder(tx, branchId, userId, orderId, lines) {
        if (lines.length === 0)
            return { skipped: [] };
        const already = await tx.stockMovement.count({
            where: { orderId, type: 'CONSUMPTION' },
        });
        if (already > 0)
            return { skipped: [] };
        const plan = await this.planFor(tx, lines);
        for (const [ingredientId, quantity] of plan.needs) {
            if (quantity <= 0)
                continue;
            await this.stockService.consumeStock(tx, branchId, ingredientId, quantity, {
                type: 'CONSUMPTION',
                note: 'Order checkout',
                userId,
                allowNegative: true,
                orderId,
            });
        }
        return { skipped: plan.skipped };
    }
    async restoreForReturn(tx, branchId, userId, orderId, lines) {
        const plan = await this.planFor(tx, lines);
        let restored = 0;
        for (const [ingredientId, quantity] of plan.needs) {
            restored += await this.stockService.restoreStock(tx, branchId, ingredientId, quantity, { userId, orderId, note: 'Returned with refund' });
        }
        return { restored };
    }
    async planFor(tx, lines) {
        const ids = [...new Set(lines.map((l) => l.menuItemId))];
        const combos = await tx.comboComponent.findMany({
            where: { comboItemId: { in: ids } },
        });
        const allIds = [
            ...new Set([...ids, ...combos.map((c) => c.componentItemId)]),
        ];
        const rows = await tx.menuItem.findMany({
            where: { id: { in: allIds } },
            include: { recipeLines: true },
        });
        const items = new Map(rows.map((m) => [
            m.id,
            {
                id: m.id,
                name: m.name,
                isCombo: m.isCombo,
                tracking: m.inventoryTracking,
                stockIngredientId: m.stockIngredientId,
                stockQuantityPerSale: Number(m.stockQuantityPerSale),
                recipe: m.recipeLines.map((l) => ({
                    ingredientId: l.ingredientId,
                    quantity: Number(l.quantity),
                })),
            },
        ]));
        return (0, stock_plan_1.planStockUsage)(lines, items, combos);
    }
    async trackingSetupStatus(branchId) {
        const items = await this.prisma.menuItem.findMany({
            where: {
                branchId,
                isActive: true,
                isCombo: false,
                inventoryTracking: { not: 'NONE' },
            },
            select: {
                id: true,
                name: true,
                inventoryTracking: true,
                stockIngredientId: true,
                stockQuantityPerSale: true,
                _count: { select: { recipeLines: true } },
            },
            orderBy: { name: 'asc' },
        });
        const problems = items.flatMap((i) => {
            if (i.inventoryTracking === 'RECIPE' && i._count.recipeLines === 0) {
                return [
                    { menuItemId: i.id, name: i.name, reason: 'NO_RECIPE' },
                ];
            }
            if (i.inventoryTracking === 'DIRECT' &&
                (!i.stockIngredientId || Number(i.stockQuantityPerSale) <= 0)) {
                return [
                    { menuItemId: i.id, name: i.name, reason: 'NO_STOCK_ITEM' },
                ];
            }
            return [];
        });
        const [untracked, tracked] = await Promise.all([
            this.prisma.menuItem.count({
                where: {
                    branchId,
                    isActive: true,
                    isCombo: false,
                    inventoryTracking: 'NONE',
                },
            }),
            this.prisma.menuItem.count({
                where: {
                    branchId,
                    isActive: true,
                    isCombo: false,
                    inventoryTracking: { not: 'NONE' },
                },
            }),
        ]);
        return { tracked, untracked, problems };
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        stock_service_1.StockService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map