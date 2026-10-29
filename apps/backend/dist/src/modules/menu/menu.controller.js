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
exports.MenuController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const types_1 = require("@nodedr-restaurant/types");
const auth_decorator_1 = require("../../common/decorators/auth.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const branch_access_service_1 = require("../../common/services/branch-access.service");
const image_upload_config_1 = require("../../common/upload/image-upload.config");
const menu_service_1 = require("./menu.service");
let MenuController = class MenuController {
    menuService;
    branchAccess;
    constructor(menuService, branchAccess) {
        this.menuService = menuService;
        this.branchAccess = branchAccess;
    }
    async listCategories(user, branchId) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.menuService.listCategories(branchId);
    }
    async createCategory(user, branchId, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.menuService.createCategory(branchId, body);
    }
    async updateCategory(user, branchId, id, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.menuService.updateCategory(branchId, id, body);
    }
    async deleteCategory(user, branchId, id) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.menuService.deleteCategory(branchId, id);
    }
    async listStations(user, branchId) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.menuService.listStations(branchId);
    }
    async createStation(user, branchId, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.menuService.createStation(branchId, body.name, body.printerName);
    }
    async listItems(user, branchId, categoryId) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.menuService.listItems(branchId, categoryId);
    }
    async getItem(user, branchId, id) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.menuService.getItem(branchId, id);
    }
    async createItem(user, branchId, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.menuService.createItem(branchId, body);
    }
    uploadItemImage(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        (0, image_upload_config_1.assertValidImageSignature)(file.path);
        return { url: `/api/uploads/${file.filename}` };
    }
    async updateItem(user, branchId, id, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.menuService.updateItem(branchId, id, user.id, body);
    }
    async deleteItem(user, branchId, id) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.menuService.deleteItem(branchId, id);
    }
    async listModifierGroups(user, branchId) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.menuService.listModifierGroups(branchId);
    }
    async createModifierGroup(user, branchId, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.menuService.createModifierGroup(branchId, body);
    }
    async updateModifierGroup(user, branchId, id, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.menuService.updateModifierGroup(branchId, id, body);
    }
    async deleteModifierGroup(user, branchId, id) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.menuService.deleteModifierGroup(branchId, id);
    }
    async getComboComponents(user, branchId, id) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.menuService.getComboComponents(branchId, id);
    }
    async setComboComponents(user, branchId, id, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        const { components } = body;
        return this.menuService.setComboComponents(branchId, id, components);
    }
};
exports.MenuController = MenuController;
__decorate([
    (0, auth_decorator_1.Auth)('menu.view'),
    (0, common_1.Get)('categories'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "listCategories", null);
__decorate([
    (0, auth_decorator_1.Auth)('menu.manage'),
    (0, common_1.Post)('categories'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.menuCategorySchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "createCategory", null);
__decorate([
    (0, auth_decorator_1.Auth)('menu.manage'),
    (0, common_1.Patch)('categories/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "updateCategory", null);
__decorate([
    (0, auth_decorator_1.Auth)('menu.manage'),
    (0, common_1.Delete)('categories/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "deleteCategory", null);
__decorate([
    (0, auth_decorator_1.Auth)('menu.manage'),
    (0, common_1.Get)('stations'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "listStations", null);
__decorate([
    (0, auth_decorator_1.Auth)('menu.manage'),
    (0, common_1.Post)('stations'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "createStation", null);
__decorate([
    (0, auth_decorator_1.Auth)('menu.view'),
    (0, common_1.Get)('items'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('categoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "listItems", null);
__decorate([
    (0, auth_decorator_1.Auth)('menu.view'),
    (0, common_1.Get)('items/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "getItem", null);
__decorate([
    (0, auth_decorator_1.Auth)('menu.manage'),
    (0, common_1.Post)('items'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.menuItemSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "createItem", null);
__decorate([
    (0, auth_decorator_1.Auth)('menu.manage'),
    (0, common_1.Post)('items/upload-image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', image_upload_config_1.imageUploadOptions)),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MenuController.prototype, "uploadItemImage", null);
__decorate([
    (0, auth_decorator_1.Auth)('menu.manage'),
    (0, common_1.Patch)('items/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "updateItem", null);
__decorate([
    (0, auth_decorator_1.Auth)('menu.manage'),
    (0, common_1.Delete)('items/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "deleteItem", null);
__decorate([
    (0, auth_decorator_1.Auth)('menu.manage'),
    (0, common_1.Get)('modifier-groups'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "listModifierGroups", null);
__decorate([
    (0, auth_decorator_1.Auth)('menu.manage'),
    (0, common_1.Post)('modifier-groups'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.modifierGroupSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "createModifierGroup", null);
__decorate([
    (0, auth_decorator_1.Auth)('menu.manage'),
    (0, common_1.Patch)('modifier-groups/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "updateModifierGroup", null);
__decorate([
    (0, auth_decorator_1.Auth)('menu.manage'),
    (0, common_1.Delete)('modifier-groups/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "deleteModifierGroup", null);
__decorate([
    (0, auth_decorator_1.Auth)('menu.manage'),
    (0, common_1.Get)('items/:id/combo-components'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "getComboComponents", null);
__decorate([
    (0, auth_decorator_1.Auth)('menu.manage'),
    (0, common_1.Post)('items/:id/combo-components'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.setComboComponentsSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "setComboComponents", null);
exports.MenuController = MenuController = __decorate([
    (0, swagger_1.ApiTags)('menu'),
    (0, common_1.Controller)('v1/menu'),
    __metadata("design:paramtypes", [menu_service_1.MenuService,
        branch_access_service_1.BranchAccessService])
], MenuController);
//# sourceMappingURL=menu.controller.js.map