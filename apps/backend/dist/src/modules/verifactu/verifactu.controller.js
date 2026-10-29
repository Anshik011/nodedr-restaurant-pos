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
exports.VerifactuController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const multer_1 = require("multer");
const zod_1 = require("zod");
const auth_decorator_1 = require("../../common/decorators/auth.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const branch_access_service_1 = require("../../common/services/branch-access.service");
const verifactu_service_1 = require("./verifactu.service");
const settingsSchema = zod_1.z.object({
    enabled: zod_1.z.boolean(),
    environment: zod_1.z.enum(['TEST', 'PRODUCTION']),
    seriesPrefix: zod_1.z.string().min(1).max(12),
});
let VerifactuController = class VerifactuController {
    service;
    branchAccess;
    constructor(service, branchAccess) {
        this.service = service;
        this.branchAccess = branchAccess;
    }
    async settings(user, branchId) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.service.getSettings(user.restaurantId, branchId);
    }
    async save(user, branchId, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        const parsed = settingsSchema.safeParse(body);
        if (!parsed.success)
            throw new common_1.BadRequestException('Invalid VERI*FACTU settings');
        return this.service.saveSettings(user.restaurantId, user.id, branchId, parsed.data);
    }
    async certificate(user, branchId, file, password) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        if (!file)
            throw new common_1.BadRequestException('Choose the .p12 or .pfx certificate file.');
        return this.service.uploadCertificate(user.restaurantId, user.id, branchId, file.buffer, password ?? '');
    }
    async records(user, branchId, take, skip) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.service.records(user.restaurantId, branchId, Number(take) || 50, Number(skip) || 0);
    }
    async verify(user, branchId) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.service.verifyChain(user.restaurantId, branchId);
    }
    async send(user, branchId) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.service.sendNow(user.restaurantId, branchId);
    }
    async export(user, branchId) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.service.exportXml(user.restaurantId, branchId);
    }
};
exports.VerifactuController = VerifactuController;
__decorate([
    (0, auth_decorator_1.Auth)('settings.manage'),
    (0, common_1.Get)('settings'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], VerifactuController.prototype, "settings", null);
__decorate([
    (0, auth_decorator_1.Auth)('settings.manage'),
    (0, common_1.Put)('settings'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], VerifactuController.prototype, "save", null);
__decorate([
    (0, auth_decorator_1.Auth)('settings.manage'),
    (0, common_1.Post)('certificate'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 256 * 1024 },
    })),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.UploadedFile)()),
    __param(3, (0, common_1.Body)('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, String]),
    __metadata("design:returntype", Promise)
], VerifactuController.prototype, "certificate", null);
__decorate([
    (0, auth_decorator_1.Auth)('settings.manage'),
    (0, common_1.Get)('records'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('take')),
    __param(3, (0, common_1.Query)('skip')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], VerifactuController.prototype, "records", null);
__decorate([
    (0, auth_decorator_1.Auth)('settings.manage'),
    (0, common_1.Get)('verify'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], VerifactuController.prototype, "verify", null);
__decorate([
    (0, auth_decorator_1.Auth)('settings.manage'),
    (0, common_1.Post)('send'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], VerifactuController.prototype, "send", null);
__decorate([
    (0, auth_decorator_1.Auth)('settings.manage'),
    (0, common_1.Get)('export.xml'),
    (0, common_1.Header)('Content-Type', 'application/xml; charset=utf-8'),
    (0, common_1.Header)('Content-Disposition', 'attachment; filename="verifactu-records.xml"'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], VerifactuController.prototype, "export", null);
exports.VerifactuController = VerifactuController = __decorate([
    (0, swagger_1.ApiTags)('verifactu'),
    (0, common_1.Controller)('v1/verifactu'),
    __metadata("design:paramtypes", [verifactu_service_1.VerifactuService,
        branch_access_service_1.BranchAccessService])
], VerifactuController);
//# sourceMappingURL=verifactu.controller.js.map