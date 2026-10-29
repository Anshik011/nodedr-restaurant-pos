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
exports.PurchaseRequestsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const NEXT_STATUS = {
    DRAFT: ['PENDING_APPROVAL'],
    PENDING_APPROVAL: ['APPROVED', 'REJECTED'],
    APPROVED: ['CONVERTED'],
    REJECTED: [],
    CONVERTED: [],
};
let PurchaseRequestsService = class PurchaseRequestsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    listPurchaseRequests(branchId, status) {
        return this.prisma.purchaseRequest.findMany({
            where: { branchId, ...(status ? { status } : {}) },
            include: {
                items: { include: { ingredient: true } },
                requestedBy: { select: { id: true, name: true } },
                approvedBy: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getPurchaseRequest(branchId, id) {
        const request = await this.prisma.purchaseRequest.findFirst({
            where: { id, branchId },
            include: {
                items: { include: { ingredient: true } },
                requestedBy: { select: { id: true, name: true } },
                approvedBy: { select: { id: true, name: true } },
            },
        });
        if (!request)
            throw new common_1.NotFoundException('Purchase request not found');
        return request;
    }
    async createPurchaseRequest(branchId, userId, dto) {
        const ingredientIds = dto.items.map((i) => i.ingredientId);
        const ingredientCount = await this.prisma.ingredient.count({
            where: { id: { in: ingredientIds }, branchId },
        });
        if (ingredientCount !== new Set(ingredientIds).size) {
            throw new common_1.BadRequestException('One or more ingredients not found in this branch');
        }
        const requestNumber = await this.nextRequestNumber(branchId);
        return this.prisma.purchaseRequest.create({
            data: {
                branchId,
                requestNumber,
                notes: dto.notes,
                requestedById: userId,
                items: {
                    create: dto.items.map((i) => ({
                        ingredientId: i.ingredientId,
                        quantityRequested: i.quantityRequested,
                        notes: i.notes,
                    })),
                },
            },
            include: { items: true },
        });
    }
    async updateStatus(branchId, id, userId, status) {
        const request = await this.getPurchaseRequest(branchId, id);
        const allowed = NEXT_STATUS[request.status];
        if (!allowed.includes(status)) {
            throw new common_1.BadRequestException(`Cannot move purchase request from ${request.status} to ${status}`);
        }
        return this.prisma.purchaseRequest.update({
            where: { id },
            data: {
                status,
                ...(status === 'APPROVED' ? { approvedById: userId } : {}),
            },
        });
    }
    async nextRequestNumber(branchId) {
        const count = await this.prisma.purchaseRequest.count({
            where: { branchId },
        });
        return `PR-${String(count + 1).padStart(4, '0')}`;
    }
};
exports.PurchaseRequestsService = PurchaseRequestsService;
exports.PurchaseRequestsService = PurchaseRequestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PurchaseRequestsService);
//# sourceMappingURL=purchase-requests.service.js.map