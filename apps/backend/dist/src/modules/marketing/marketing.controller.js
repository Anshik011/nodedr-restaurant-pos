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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const types_1 = require("@nodedr-restaurant/types");
const auth_decorator_1 = require("../../common/decorators/auth.decorator");
const audit_action_1 = require("../../audit/audit-action");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const audit_service_1 = require("../../audit/audit.service");
const branch_access_service_1 = require("../../common/services/branch-access.service");
const csv_1 = require("../reports/csv");
const marketing_service_1 = require("./marketing.service");
let MarketingController = class MarketingController {
    marketing;
    branchAccess;
    audit;
    constructor(marketing, branchAccess, audit) {
        this.marketing = marketing;
        this.branchAccess = branchAccess;
        this.audit = audit;
    }
    access(u, branchId) {
        return this.branchAccess.assertAccess(u.restaurantId, branchId);
    }
    async coupons(u, branchId) {
        await this.access(u, branchId);
        return this.marketing.listCoupons(branchId);
    }
    async createCoupon(u, branchId, body) {
        await this.access(u, branchId);
        return this.marketing.createCoupon(branchId, body);
    }
    async couponActive(u, branchId, id, body) {
        await this.access(u, branchId);
        return this.marketing.setCouponActive(branchId, id, !!body.isActive);
    }
    async deleteCoupon(u, branchId, id) {
        await this.access(u, branchId);
        return this.marketing.deleteCoupon(branchId, id);
    }
    async promotions(u, branchId) {
        await this.access(u, branchId);
        return this.marketing.listPromotions(branchId);
    }
    async createPromotion(u, branchId, body) {
        await this.access(u, branchId);
        return this.marketing.createPromotion(branchId, body);
    }
    async promotionActive(u, branchId, id, body) {
        await this.access(u, branchId);
        return this.marketing.setPromotionActive(branchId, id, !!body.isActive);
    }
    async deletePromotion(u, branchId, id) {
        await this.access(u, branchId);
        return this.marketing.deletePromotion(branchId, id);
    }
    async campaigns(u, branchId) {
        await this.access(u, branchId);
        return this.marketing.listCampaigns(branchId);
    }
    async createCampaign(u, branchId, body) {
        await this.access(u, branchId);
        return this.marketing.createCampaign(branchId, body);
    }
    async deleteCampaign(u, branchId, id) {
        await this.access(u, branchId);
        return this.marketing.deleteCampaign(branchId, id);
    }
    async audience(u, branchId, id) {
        await this.access(u, branchId);
        const { recipients } = await this.marketing.audience(branchId, id);
        return { count: recipients.length, recipients: recipients.slice(0, 50) };
    }
    async sendCampaign(u, branchId, id) {
        await this.access(u, branchId);
        const result = await this.marketing.send(branchId, id);
        await this.audit.record({
            userId: u.id,
            action: 'campaign.sent',
            entity: 'Campaign',
            entityId: id,
            metadata: result,
        });
        return result;
    }
    async audienceCsv(u, branchId, id) {
        await this.access(u, branchId);
        const { campaign, recipients } = await this.marketing.audience(branchId, id);
        return (0, csv_1.toCsv)(['Name', campaign.channel === 'EMAIL' ? 'Email' : 'Phone', 'Message'], recipients.map((r) => [r.name, r.contact, campaign.message]));
    }
};
exports.MarketingController = MarketingController;
__decorate([
    (0, auth_decorator_1.Auth)('marketing.manage'),
    (0, common_1.Get)('coupons'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MarketingController.prototype, "coupons", null);
__decorate([
    (0, auth_decorator_1.Auth)('marketing.manage'),
    (0, audit_action_1.AuditAction)('coupon.created', 'Coupon'),
    (0, common_1.Post)('coupons'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.couponSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], MarketingController.prototype, "createCoupon", null);
__decorate([
    (0, auth_decorator_1.Auth)('marketing.manage'),
    (0, audit_action_1.AuditAction)('coupon.toggled', 'Coupon'),
    (0, common_1.Patch)('coupons/:id/active'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], MarketingController.prototype, "couponActive", null);
__decorate([
    (0, auth_decorator_1.Auth)('marketing.manage'),
    (0, audit_action_1.AuditAction)('coupon.deleted', 'Coupon'),
    (0, common_1.Delete)('coupons/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MarketingController.prototype, "deleteCoupon", null);
__decorate([
    (0, auth_decorator_1.Auth)('marketing.manage'),
    (0, common_1.Get)('promotions'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MarketingController.prototype, "promotions", null);
__decorate([
    (0, auth_decorator_1.Auth)('marketing.manage'),
    (0, audit_action_1.AuditAction)('promotion.created', 'Promotion'),
    (0, common_1.Post)('promotions'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.promotionSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], MarketingController.prototype, "createPromotion", null);
__decorate([
    (0, auth_decorator_1.Auth)('marketing.manage'),
    (0, audit_action_1.AuditAction)('promotion.toggled', 'Promotion'),
    (0, common_1.Patch)('promotions/:id/active'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], MarketingController.prototype, "promotionActive", null);
__decorate([
    (0, auth_decorator_1.Auth)('marketing.manage'),
    (0, audit_action_1.AuditAction)('promotion.deleted', 'Promotion'),
    (0, common_1.Delete)('promotions/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MarketingController.prototype, "deletePromotion", null);
__decorate([
    (0, auth_decorator_1.Auth)('marketing.manage'),
    (0, common_1.Get)('campaigns'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MarketingController.prototype, "campaigns", null);
__decorate([
    (0, auth_decorator_1.Auth)('marketing.manage'),
    (0, audit_action_1.AuditAction)('campaign.created', 'Campaign'),
    (0, common_1.Post)('campaigns'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.campaignSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], MarketingController.prototype, "createCampaign", null);
__decorate([
    (0, auth_decorator_1.Auth)('marketing.manage'),
    (0, audit_action_1.AuditAction)('campaign.deleted', 'Campaign'),
    (0, common_1.Delete)('campaigns/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MarketingController.prototype, "deleteCampaign", null);
__decorate([
    (0, auth_decorator_1.Auth)('marketing.manage'),
    (0, common_1.Get)('campaigns/:id/audience'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MarketingController.prototype, "audience", null);
__decorate([
    (0, auth_decorator_1.Auth)('marketing.manage'),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60_000 } }),
    (0, common_1.Post)('campaigns/:id/send'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MarketingController.prototype, "sendCampaign", null);
__decorate([
    (0, auth_decorator_1.Auth)('marketing.manage', 'data.export'),
    (0, common_1.Get)('campaigns/:id/audience.csv'),
    (0, common_1.Header)('Content-Type', 'text/csv; charset=utf-8'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MarketingController.prototype, "audienceCsv", null);
exports.MarketingController = MarketingController = __decorate([
    (0, swagger_1.ApiTags)('marketing'),
    (0, common_1.Controller)('v1/marketing'),
    __metadata("design:paramtypes", [marketing_service_1.MarketingService,
        branch_access_service_1.BranchAccessService,
        audit_service_1.AuditService])
], MarketingController);
//# sourceMappingURL=marketing.controller.js.map