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
exports.GiftCardsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const types_1 = require("@nodedr-restaurant/types");
const auth_decorator_1 = require("../../common/decorators/auth.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const branch_access_service_1 = require("../../common/services/branch-access.service");
const gift_cards_service_1 = require("./gift-cards.service");
let GiftCardsController = class GiftCardsController {
    giftCardsService;
    branchAccess;
    constructor(giftCardsService, branchAccess) {
        this.giftCardsService = giftCardsService;
        this.branchAccess = branchAccess;
    }
    async list(user, branchId) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.giftCardsService.list(branchId);
    }
    async getByCode(user, branchId, code) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.giftCardsService.getByCode(branchId, code);
    }
    async issue(user, branchId, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.giftCardsService.issue(branchId, body);
    }
};
exports.GiftCardsController = GiftCardsController;
__decorate([
    (0, auth_decorator_1.Auth)('customers.manage'),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GiftCardsController.prototype, "list", null);
__decorate([
    (0, auth_decorator_1.Auth)('customers.manage'),
    (0, common_1.Get)(':code'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], GiftCardsController.prototype, "getByCode", null);
__decorate([
    (0, auth_decorator_1.Auth)('customers.manage'),
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.issueGiftCardSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], GiftCardsController.prototype, "issue", null);
exports.GiftCardsController = GiftCardsController = __decorate([
    (0, swagger_1.ApiTags)('gift-cards'),
    (0, common_1.Controller)('v1/gift-cards'),
    __metadata("design:paramtypes", [gift_cards_service_1.GiftCardsService,
        branch_access_service_1.BranchAccessService])
], GiftCardsController);
//# sourceMappingURL=gift-cards.controller.js.map