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
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const types_1 = require("@nodedr-restaurant/types");
const auth_decorator_1 = require("../../common/decorators/auth.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const branch_access_service_1 = require("../../common/services/branch-access.service");
const image_upload_config_1 = require("../../common/upload/image-upload.config");
const settings_service_1 = require("./settings.service");
let SettingsController = class SettingsController {
    settingsService;
    branchAccess;
    constructor(settingsService, branchAccess) {
        this.settingsService = settingsService;
        this.branchAccess = branchAccess;
    }
    async get(user, branchId) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.settingsService.get(user.restaurantId, branchId);
    }
    async updateRestaurant(user, body) {
        return this.settingsService.updateRestaurant(user.restaurantId, user.id, body);
    }
    uploadRestaurantLogo(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        (0, image_upload_config_1.assertValidImageSignature)(file.path);
        return { url: `/api/uploads/${file.filename}` };
    }
    async updateBranch(user, branchId, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.settingsService.updateBranch(branchId, user.id, body);
    }
    async setKiosk(user, branchId, action) {
        if (action !== 'enable' && action !== 'rotate' && action !== 'disable') {
            throw new common_1.BadRequestException('Unknown kiosk action');
        }
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.settingsService.setKioskToken(branchId, user.id, action);
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, auth_decorator_1.Auth)('settings.manage'),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "get", null);
__decorate([
    (0, auth_decorator_1.Auth)('settings.manage'),
    (0, common_1.Patch)('restaurant'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.restaurantSettingsSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "updateRestaurant", null);
__decorate([
    (0, auth_decorator_1.Auth)('settings.manage'),
    (0, common_1.Post)('restaurant/logo'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', image_upload_config_1.imageUploadOptions)),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "uploadRestaurantLogo", null);
__decorate([
    (0, auth_decorator_1.Auth)('settings.manage'),
    (0, common_1.Patch)('branch'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.branchSettingsSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "updateBranch", null);
__decorate([
    (0, auth_decorator_1.Auth)('settings.manage'),
    (0, common_1.Post)('kiosk/:action'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('action')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "setKiosk", null);
exports.SettingsController = SettingsController = __decorate([
    (0, swagger_1.ApiTags)('settings'),
    (0, common_1.Controller)('v1/settings'),
    __metadata("design:paramtypes", [settings_service_1.SettingsService,
        branch_access_service_1.BranchAccessService])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map