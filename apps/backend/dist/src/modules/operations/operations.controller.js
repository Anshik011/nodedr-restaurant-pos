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
exports.OperationsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const swagger_1 = require("@nestjs/swagger");
const types_1 = require("@nodedr-restaurant/types");
const auth_decorator_1 = require("../../common/decorators/auth.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const branch_access_service_1 = require("../../common/services/branch-access.service");
const operations_service_1 = require("./operations.service");
let OperationsController = class OperationsController {
    ops;
    branchAccess;
    constructor(ops, branchAccess) {
        this.ops = ops;
        this.branchAccess = branchAccess;
    }
    access(u, branchId) {
        return this.branchAccess.assertAccess(u.restaurantId, branchId);
    }
    async equipment(u, branchId) {
        await this.access(u, branchId);
        return this.ops.listEquipment(branchId);
    }
    async createEquipment(u, branchId, body) {
        await this.access(u, branchId);
        return this.ops.createEquipment(branchId, body);
    }
    async retire(u, branchId, id) {
        await this.access(u, branchId);
        return this.ops.retireEquipment(branchId, id);
    }
    async logs(u, branchId, id) {
        await this.access(u, branchId);
        return this.ops.listLogs(branchId, id);
    }
    async logService(u, branchId, id, body) {
        await this.access(u, branchId);
        return this.ops.logService(branchId, id, body);
    }
    async documents(u, branchId, category) {
        await this.access(u, branchId);
        return this.ops.listDocuments(branchId, category);
    }
    async document(u, branchId, id) {
        await this.access(u, branchId);
        return this.ops.getDocument(branchId, id);
    }
    async createDocument(u, branchId, body) {
        await this.access(u, branchId);
        return this.ops.createDocument(branchId, body);
    }
    async updateDocument(u, branchId, id, body) {
        await this.access(u, branchId);
        return this.ops.updateDocument(branchId, id, body);
    }
    async deleteDocument(u, branchId, id) {
        await this.access(u, branchId);
        return this.ops.deleteDocument(branchId, id);
    }
    async attach(u, branchId, id, file) {
        await this.access(u, branchId);
        if (!file)
            throw new common_1.BadRequestException('Choose a file (max 5 MB)');
        return this.ops.addDocumentFile(branchId, id, file);
    }
    async download(u, branchId, id, fileId, res) {
        await this.access(u, branchId);
        const f = await this.ops.getDocumentFile(branchId, id, fileId);
        res.setHeader('Content-Type', f.mimeType);
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(f.fileName)}"`);
        res.send(Buffer.from(f.data));
    }
    async removeFile(u, branchId, id, fileId) {
        await this.access(u, branchId);
        return this.ops.deleteDocumentFile(branchId, id, fileId);
    }
};
exports.OperationsController = OperationsController;
__decorate([
    (0, auth_decorator_1.Auth)('operations.manage'),
    (0, common_1.Get)('equipment'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "equipment", null);
__decorate([
    (0, auth_decorator_1.Auth)('operations.manage'),
    (0, common_1.Post)('equipment'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.equipmentSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "createEquipment", null);
__decorate([
    (0, auth_decorator_1.Auth)('operations.manage'),
    (0, common_1.Delete)('equipment/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "retire", null);
__decorate([
    (0, auth_decorator_1.Auth)('operations.manage'),
    (0, common_1.Get)('equipment/:id/logs'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "logs", null);
__decorate([
    (0, auth_decorator_1.Auth)('operations.manage'),
    (0, common_1.Post)('equipment/:id/logs'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.serviceLogSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "logService", null);
__decorate([
    (0, auth_decorator_1.Auth)('operations.manage'),
    (0, common_1.Get)('documents'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "documents", null);
__decorate([
    (0, auth_decorator_1.Auth)('operations.manage'),
    (0, common_1.Get)('documents/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "document", null);
__decorate([
    (0, auth_decorator_1.Auth)('operations.manage'),
    (0, common_1.Post)('documents'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.documentSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "createDocument", null);
__decorate([
    (0, auth_decorator_1.Auth)('operations.manage'),
    (0, common_1.Patch)('documents/:id'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.documentUpdateSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "updateDocument", null);
__decorate([
    (0, auth_decorator_1.Auth)('operations.manage'),
    (0, common_1.Delete)('documents/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "deleteDocument", null);
__decorate([
    (0, auth_decorator_1.Auth)('operations.manage'),
    (0, common_1.Post)('documents/:id/files'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: operations_service_1.ATTACHMENT_MAX_BYTES, files: 1 },
    })),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "attach", null);
__decorate([
    (0, auth_decorator_1.Auth)('operations.manage'),
    (0, common_1.Get)('documents/:id/files/:fileId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Param)('fileId')),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "download", null);
__decorate([
    (0, auth_decorator_1.Auth)('operations.manage'),
    (0, common_1.Delete)('documents/:id/files/:fileId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Param)('fileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "removeFile", null);
exports.OperationsController = OperationsController = __decorate([
    (0, swagger_1.ApiTags)('operations'),
    (0, common_1.Controller)('v1/operations'),
    __metadata("design:paramtypes", [operations_service_1.OperationsService,
        branch_access_service_1.BranchAccessService])
], OperationsController);
//# sourceMappingURL=operations.controller.js.map