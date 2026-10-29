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
exports.SupplierQuotationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const NEXT_STATUS = {
    DRAFT: ['RECEIVED'],
    RECEIVED: ['ACCEPTED', 'REJECTED'],
    ACCEPTED: [],
    REJECTED: [],
};
let SupplierQuotationsService = class SupplierQuotationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    listQuotations(branchId, ingredientId) {
        return this.prisma.supplierQuotation.findMany({
            where: {
                branchId,
                ...(ingredientId ? { items: { some: { ingredientId } } } : {}),
            },
            include: {
                supplier: { select: { id: true, name: true } },
                items: { include: { ingredient: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getQuotation(branchId, id) {
        const quotation = await this.prisma.supplierQuotation.findFirst({
            where: { id, branchId },
            include: {
                supplier: true,
                items: { include: { ingredient: true } },
                createdBy: { select: { id: true, name: true } },
            },
        });
        if (!quotation)
            throw new common_1.NotFoundException('Quotation not found');
        return quotation;
    }
    async compareForIngredient(branchId, ingredientId) {
        const items = await this.prisma.supplierQuotationItem.findMany({
            where: {
                ingredientId,
                supplierQuotation: {
                    branchId,
                    status: { in: ['RECEIVED', 'ACCEPTED'] },
                },
            },
            include: {
                supplierQuotation: { include: { supplier: true } },
            },
            orderBy: { unitPrice: 'asc' },
        });
        return items.map((item) => ({
            supplierId: item.supplierQuotation.supplierId,
            supplierName: item.supplierQuotation.supplier.name,
            quotationId: item.supplierQuotationId,
            quotationNumber: item.supplierQuotation.quotationNumber,
            unitPrice: item.unitPrice,
            quantityQuoted: item.quantityQuoted,
            validUntil: item.supplierQuotation.validUntil,
        }));
    }
    async createQuotation(branchId, userId, dto) {
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
        const quotationNumber = await this.nextQuotationNumber(branchId);
        return this.prisma.supplierQuotation.create({
            data: {
                branchId,
                supplierId: dto.supplierId,
                quotationNumber,
                validUntil: dto.validUntil,
                notes: dto.notes,
                createdById: userId,
                items: {
                    create: dto.items.map((i) => ({
                        ingredientId: i.ingredientId,
                        quantityQuoted: i.quantityQuoted,
                        unitPrice: i.unitPrice,
                    })),
                },
            },
            include: { items: true },
        });
    }
    async updateStatus(branchId, id, status) {
        const quotation = await this.getQuotation(branchId, id);
        const allowed = NEXT_STATUS[quotation.status];
        if (!allowed.includes(status)) {
            throw new common_1.BadRequestException(`Cannot move quotation from ${quotation.status} to ${status}`);
        }
        return this.prisma.supplierQuotation.update({
            where: { id },
            data: { status },
        });
    }
    async nextQuotationNumber(branchId) {
        const count = await this.prisma.supplierQuotation.count({
            where: { branchId },
        });
        return `QT-${String(count + 1).padStart(4, '0')}`;
    }
};
exports.SupplierQuotationsService = SupplierQuotationsService;
exports.SupplierQuotationsService = SupplierQuotationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SupplierQuotationsService);
//# sourceMappingURL=supplier-quotations.service.js.map