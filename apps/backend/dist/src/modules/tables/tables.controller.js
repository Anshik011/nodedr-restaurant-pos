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
exports.TablesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const types_1 = require("@nodedr-restaurant/types");
const zod_1 = require("zod");
const auth_decorator_1 = require("../../common/decorators/auth.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const branch_access_service_1 = require("../../common/services/branch-access.service");
const tables_service_1 = require("./tables.service");
let TablesController = class TablesController {
    tablesService;
    branchAccess;
    constructor(tablesService, branchAccess) {
        this.tablesService = tablesService;
        this.branchAccess = branchAccess;
    }
    async listRequests(user, branchId) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.tablesService.listOpenRequests(branchId);
    }
    async resolveRequest(user, branchId, id) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.tablesService.resolveRequest(branchId, id);
    }
    async listFloors(user, branchId) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.tablesService.listFloors(branchId);
    }
    async createFloor(user, branchId, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.tablesService.createFloor(branchId, body);
    }
    async createTable(user, branchId, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.tablesService.createTable(branchId, body);
    }
    async createTables(user, branchId, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.tablesService.createTables(branchId, body);
    }
    async updateFloor(user, branchId, id, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.tablesService.updateFloor(branchId, id, body);
    }
    async updateLayout(user, branchId, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.tablesService.updateTableLayout(branchId, body);
    }
    async updateTable(user, branchId, id, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.tablesService.updateTable(branchId, id, body);
    }
    async updateStatus(user, branchId, id, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.tablesService.updateTableStatus(branchId, id, body.status, body.assignedWaiterId);
    }
    async rotateQrToken(user, branchId, id) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.tablesService.rotateQrToken(branchId, id);
    }
    async deleteTable(user, branchId, id) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.tablesService.deleteTable(branchId, id);
    }
};
exports.TablesController = TablesController;
__decorate([
    (0, auth_decorator_1.Auth)('tables.view'),
    (0, common_1.Get)('requests'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TablesController.prototype, "listRequests", null);
__decorate([
    (0, auth_decorator_1.Auth)('tables.view', 'orders.edit'),
    (0, common_1.Patch)('requests/:id/resolve'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], TablesController.prototype, "resolveRequest", null);
__decorate([
    (0, auth_decorator_1.Auth)('tables.view'),
    (0, common_1.Get)('floors'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TablesController.prototype, "listFloors", null);
__decorate([
    (0, auth_decorator_1.Auth)('tables.manage'),
    (0, common_1.Post)('floors'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.floorSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TablesController.prototype, "createFloor", null);
__decorate([
    (0, auth_decorator_1.Auth)('tables.manage'),
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.tableSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TablesController.prototype, "createTable", null);
__decorate([
    (0, auth_decorator_1.Auth)('tables.manage'),
    (0, common_1.Post)('bulk'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.bulkTableCreateSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TablesController.prototype, "createTables", null);
__decorate([
    (0, auth_decorator_1.Auth)('tables.manage'),
    (0, common_1.Patch)('floors/:id'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.floorUpdateSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], TablesController.prototype, "updateFloor", null);
__decorate([
    (0, auth_decorator_1.Auth)('tables.manage'),
    (0, common_1.Patch)('layout'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(zod_1.z.array(types_1.tableLayoutUpdateSchema))),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Array]),
    __metadata("design:returntype", Promise)
], TablesController.prototype, "updateLayout", null);
__decorate([
    (0, auth_decorator_1.Auth)('tables.manage'),
    (0, common_1.Patch)(':id'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.tableUpdateSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], TablesController.prototype, "updateTable", null);
__decorate([
    (0, auth_decorator_1.Auth)('tables.view', 'orders.edit'),
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], TablesController.prototype, "updateStatus", null);
__decorate([
    (0, auth_decorator_1.Auth)('tables.manage'),
    (0, common_1.Post)(':id/qr-token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], TablesController.prototype, "rotateQrToken", null);
__decorate([
    (0, auth_decorator_1.Auth)('tables.manage'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], TablesController.prototype, "deleteTable", null);
exports.TablesController = TablesController = __decorate([
    (0, swagger_1.ApiTags)('tables'),
    (0, common_1.Controller)('v1/tables'),
    __metadata("design:paramtypes", [tables_service_1.TablesService,
        branch_access_service_1.BranchAccessService])
], TablesController);
//# sourceMappingURL=tables.controller.js.map