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
exports.MarketingService = void 0;
const common_1 = require("@nestjs/common");
const branch_time_service_1 = require("../../common/services/branch-time.service");
const time_1 = require("../../common/time");
const prisma_service_1 = require("../../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const webhooks_service_1 = require("../webhooks/webhooks.service");
const discounts_1 = require("./discounts");
const asDate = (s) => (s ? new Date(s) : null);
let MarketingService = class MarketingService {
    prisma;
    time;
    email;
    webhooks;
    constructor(prisma, time, email, webhooks) {
        this.prisma = prisma;
        this.time = time;
        this.email = email;
        this.webhooks = webhooks;
    }
    listCoupons(branchId) {
        return this.prisma.coupon.findMany({
            where: { branchId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createCoupon(branchId, dto) {
        const code = dto.code.toUpperCase();
        const clash = await this.prisma.coupon.findUnique({
            where: { branchId_code: { branchId, code } },
        });
        if (clash)
            throw new common_1.BadRequestException('That coupon code already exists');
        return this.prisma.coupon.create({
            data: {
                branchId,
                code,
                kind: dto.kind,
                value: dto.value,
                minOrderAmount: dto.minOrderAmount,
                maxDiscount: dto.maxDiscount,
                validFrom: asDate(dto.validFrom),
                validUntil: asDate(dto.validUntil),
                usageLimit: dto.usageLimit,
                isActive: dto.isActive,
            },
        });
    }
    async setCouponActive(branchId, id, isActive) {
        await this.getCoupon(branchId, id);
        return this.prisma.coupon.update({ where: { id }, data: { isActive } });
    }
    async deleteCoupon(branchId, id) {
        await this.getCoupon(branchId, id);
        await this.prisma.coupon.delete({ where: { id } });
        return { ok: true };
    }
    async getCoupon(branchId, id) {
        const c = await this.prisma.coupon.findFirst({ where: { id, branchId } });
        if (!c)
            throw new common_1.NotFoundException('Coupon not found');
        return c;
    }
    async listPromotions(branchId) {
        const rows = await this.prisma.promotion.findMany({
            where: { branchId },
            orderBy: { createdAt: 'desc' },
        });
        return rows.map((p) => ({
            ...p,
            startTime: (0, discounts_1.fromMinutes)(p.startMinute),
            endTime: (0, discounts_1.fromMinutes)(p.endMinute),
        }));
    }
    createPromotion(branchId, dto) {
        return this.prisma.promotion.create({
            data: {
                branchId,
                name: dto.name,
                kind: dto.kind,
                value: dto.value,
                daysOfWeek: [...new Set(dto.daysOfWeek)].sort(),
                startMinute: (0, discounts_1.toMinutes)(dto.startTime),
                endMinute: (0, discounts_1.toMinutes)(dto.endTime),
                isActive: dto.isActive,
            },
        });
    }
    async setPromotionActive(branchId, id, isActive) {
        const p = await this.prisma.promotion.findFirst({
            where: { id, branchId },
        });
        if (!p)
            throw new common_1.NotFoundException('Promotion not found');
        return this.prisma.promotion.update({ where: { id }, data: { isActive } });
    }
    async deletePromotion(branchId, id) {
        const p = await this.prisma.promotion.findFirst({
            where: { id, branchId },
        });
        if (!p)
            throw new common_1.NotFoundException('Promotion not found');
        await this.prisma.promotion.delete({ where: { id } });
        return { ok: true };
    }
    async resolveCheckoutDiscount(branchId, subtotal, couponCode, now = new Date()) {
        let best = { amount: 0 };
        const tz = await this.time.tzForBranch(branchId);
        const { day, minute } = (0, time_1.localMinuteAndDay)(now, tz);
        const promos = await this.prisma.promotion.findMany({
            where: { branchId, isActive: true },
        });
        for (const p of promos) {
            if (!(0, discounts_1.promotionActive)({ ...p, value: Number(p.value) }, day, minute))
                continue;
            const amount = (0, discounts_1.discountAmount)(p.kind, Number(p.value), subtotal);
            if (amount > best.amount)
                best = { amount, promotionName: p.name };
        }
        if (couponCode) {
            const coupon = await this.prisma.coupon.findUnique({
                where: {
                    branchId_code: { branchId, code: couponCode.trim().toUpperCase() },
                },
            });
            if (!coupon)
                throw new common_1.BadRequestException('That coupon code is not valid');
            const result = (0, discounts_1.evaluateCoupon)({
                kind: coupon.kind,
                value: Number(coupon.value),
                minOrderAmount: Number(coupon.minOrderAmount),
                maxDiscount: coupon.maxDiscount == null ? null : Number(coupon.maxDiscount),
                validFrom: coupon.validFrom,
                validUntil: coupon.validUntil,
                usageLimit: coupon.usageLimit,
                usedCount: coupon.usedCount,
                isActive: coupon.isActive,
            }, subtotal, now);
            if (!result.ok)
                throw new common_1.BadRequestException(result.reason);
            if (result.amount >= best.amount) {
                best = {
                    amount: result.amount,
                    couponId: coupon.id,
                    couponCode: coupon.code,
                };
            }
        }
        return { ...best, amount: (0, discounts_1.round2)(best.amount) };
    }
    async redeemCoupon(tx, couponId) {
        const updated = await tx.$executeRaw `
      UPDATE "coupons" SET "usedCount" = "usedCount" + 1
      WHERE "id" = ${couponId}
        AND "isActive" = true
        AND ("usageLimit" IS NULL OR "usedCount" < "usageLimit")`;
        if (updated === 0)
            throw new common_1.ConflictException('This coupon has just been fully used');
    }
    listCampaigns(branchId) {
        return this.prisma.campaign.findMany({
            where: { branchId },
            orderBy: { createdAt: 'desc' },
        });
    }
    createCampaign(branchId, dto) {
        return this.prisma.campaign.create({ data: { branchId, ...dto } });
    }
    async deleteCampaign(branchId, id) {
        const c = await this.prisma.campaign.findFirst({ where: { id, branchId } });
        if (!c)
            throw new common_1.NotFoundException('Campaign not found');
        await this.prisma.campaign.delete({ where: { id } });
        return { ok: true };
    }
    async audience(branchId, campaignId) {
        const c = await this.prisma.campaign.findFirst({
            where: { id: campaignId, branchId },
        });
        if (!c)
            throw new common_1.NotFoundException('Campaign not found');
        const tz = await this.time.tzForBranch(branchId);
        const customers = await this.prisma.customer.findMany({
            where: {
                branchId,
                marketingOptOut: false,
                ...(c.channel === 'EMAIL'
                    ? { email: { not: null } }
                    : { phone: { not: null } }),
            },
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                birthday: true,
                orders: {
                    where: { status: 'PAID' },
                    select: { billedAt: true },
                    orderBy: { billedAt: 'desc' },
                },
            },
        });
        const now = new Date();
        const month = Number(new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            month: 'numeric',
        }).format(now));
        const cutoff = now.getTime() - 60 * 86_400_000;
        const picked = customers.filter((cu) => {
            if (c.segment === 'ALL')
                return true;
            if (c.segment === 'LOYAL')
                return cu.orders.length >= 5;
            if (c.segment === 'LAPSED') {
                const last = cu.orders[0]?.billedAt?.getTime();
                return last != null && last < cutoff;
            }
            return cu.birthday != null && cu.birthday.getUTCMonth() + 1 === month;
        });
        return {
            campaign: c,
            recipients: picked.map((cu) => ({
                name: cu.name ?? '',
                contact: (c.channel === 'EMAIL' ? cu.email : cu.phone) ?? '',
            })),
        };
    }
    async send(branchId, campaignId) {
        const { campaign, recipients } = await this.audience(branchId, campaignId);
        if (campaign.lastSentAt &&
            Date.now() - campaign.lastSentAt.getTime() < 3600_000)
            throw new common_1.BadRequestException('This campaign was sent less than an hour ago');
        if (recipients.length === 0)
            throw new common_1.BadRequestException('No customers match this campaign yet');
        if (recipients.length > 500)
            throw new common_1.BadRequestException('A campaign can reach at most 500 customers at once — narrow the audience');
        const reserved = await this.prisma.campaign.updateMany({
            where: {
                id: campaign.id,
                OR: [
                    { lastSentAt: null },
                    { lastSentAt: { lt: new Date(Date.now() - 3600_000) } },
                ],
            },
            data: { lastSentAt: new Date(), lastSentCount: 0 },
        });
        if (reserved.count === 0)
            throw new common_1.BadRequestException('This campaign is already being sent');
        let result;
        if (campaign.channel === 'EMAIL') {
            if (!this.email.isConfigured())
                throw await this.releaseAndFail(campaign.id, 'Email is not set up on this server (SMTP_URL / SMTP_FROM)');
            const restaurant = await this.prisma.branch.findUnique({
                where: { id: branchId },
                select: { restaurant: { select: { name: true } } },
            });
            const footer = `\n\n—\nYou are receiving this because you are a customer of ${restaurant?.restaurant.name ?? 'our restaurant'}. Reply to this email to stop receiving offers.`;
            result = await this.email.sendEach(recipients.map((r) => ({
                to: r.contact,
                subject: campaign.name,
                text: campaign.message + footer,
            })));
        }
        else {
            const hasHook = await this.webhooks.hasSubscriber(branchId, 'campaign.message');
            if (!hasHook)
                throw await this.releaseAndFail(campaign.id, `Sending ${campaign.channel === 'SMS' ? 'SMS' : 'WhatsApp'} needs a webhook subscribed to "campaign.message" (Settings > Webhooks) connected to your messaging service`);
            for (const r of recipients) {
                await this.webhooks.emitForBranch(branchId, 'campaign.message', {
                    campaignId: campaign.id,
                    channel: campaign.channel,
                    to: r.contact,
                    name: r.name,
                    message: campaign.message,
                });
            }
            result = { sent: recipients.length, failed: 0 };
        }
        await this.prisma.campaign.update({
            where: { id: campaign.id },
            data: { lastSentCount: result.sent },
        });
        return result;
    }
    async releaseAndFail(campaignId, message) {
        await this.prisma.campaign.update({
            where: { id: campaignId },
            data: { lastSentAt: null, lastSentCount: null },
        });
        return new common_1.BadRequestException(message);
    }
};
exports.MarketingService = MarketingService;
exports.MarketingService = MarketingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        branch_time_service_1.BranchTimeService,
        email_service_1.EmailService,
        webhooks_service_1.WebhooksService])
], MarketingService);
//# sourceMappingURL=marketing.service.js.map