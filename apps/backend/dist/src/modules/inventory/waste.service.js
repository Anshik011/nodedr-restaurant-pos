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
exports.WasteService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const stock_service_1 = require("./stock.service");
let WasteService = class WasteService {
    prisma;
    stockService;
    constructor(prisma, stockService) {
        this.prisma = prisma;
        this.stockService = stockService;
    }
    listWasteLogs(branchId) {
        return this.prisma.wasteLog.findMany({
            where: { branchId },
            include: {
                ingredient: { select: { id: true, name: true, unit: true } },
                createdBy: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async logWaste(branchId, userId, dto) {
        const ingredient = await this.prisma.ingredient.findFirst({
            where: { id: dto.ingredientId, branchId },
        });
        if (!ingredient)
            throw new common_1.NotFoundException('Ingredient not found');
        return this.prisma.$transaction(async (tx) => {
            const portions = await this.stockService.consumeStock(tx, branchId, dto.ingredientId, dto.quantity, { type: 'WASTE', note: dto.notes, userId, allowNegative: false });
            const logs = [];
            for (const portion of portions) {
                logs.push(await tx.wasteLog.create({
                    data: {
                        branchId,
                        ingredientId: dto.ingredientId,
                        batchId: portion.batchId,
                        quantity: portion.quantity,
                        reason: dto.reason,
                        unitCostAtWaste: portion.unitCost,
                        notes: dto.notes,
                        createdById: userId,
                    },
                }));
            }
            return logs;
        });
    }
};
exports.WasteService = WasteService;
exports.WasteService = WasteService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        stock_service_1.StockService])
], WasteService);
//# sourceMappingURL=waste.service.js.map