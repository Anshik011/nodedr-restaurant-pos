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
exports.GiftCardsService = void 0;
const node_crypto_1 = require("node:crypto");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pricing_1 = require("../orders/pricing");
let GiftCardsService = class GiftCardsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    list(branchId) {
        return this.prisma.giftCard.findMany({
            where: { branchId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async issue(branchId, dto) {
        if (dto.customerId) {
            const customer = await this.prisma.customer.findFirst({
                where: { id: dto.customerId, branchId },
                select: { id: true },
            });
            if (!customer) {
                throw new common_1.BadRequestException('Customer is invalid for this branch');
            }
        }
        const code = (0, node_crypto_1.randomBytes)(6).toString('hex').toUpperCase();
        const value = (0, pricing_1.round2)(dto.initialValue);
        return this.prisma.giftCard.create({
            data: {
                branchId,
                code,
                initialValue: value,
                balance: value,
                customerId: dto.customerId,
            },
        });
    }
    async getByCode(branchId, code) {
        const card = await this.prisma.giftCard.findFirst({
            where: { code: code.toUpperCase(), branchId },
        });
        if (!card)
            throw new common_1.NotFoundException('Gift card not found');
        return card;
    }
    async debit(tx, branchId, code, maxAmount) {
        const card = await tx.giftCard.findFirst({
            where: { code: code.toUpperCase(), branchId },
        });
        if (!card || !card.isActive)
            throw new common_1.BadRequestException('Gift card not found or inactive');
        const balance = Number(card.balance);
        if (balance <= 0)
            throw new common_1.BadRequestException('Gift card has no balance remaining');
        const amountApplied = (0, pricing_1.round2)(Math.min(balance, maxAmount));
        const result = await tx.giftCard.updateMany({
            where: { id: card.id, balance: { gte: amountApplied } },
            data: { balance: { decrement: amountApplied } },
        });
        if (result.count === 0) {
            throw new common_1.BadRequestException('Gift card balance changed — please retry checkout');
        }
        return { giftCardId: card.id, amountApplied };
    }
};
exports.GiftCardsService = GiftCardsService;
exports.GiftCardsService = GiftCardsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GiftCardsService);
//# sourceMappingURL=gift-cards.service.js.map