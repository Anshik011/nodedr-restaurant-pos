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
exports.KdsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const types_1 = require("@nodedr-restaurant/types");
const auth_decorator_1 = require("../../common/decorators/auth.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const branch_access_service_1 = require("../../common/services/branch-access.service");
const kds_service_1 = require("./kds.service");
let KdsController = class KdsController {
    kdsService;
    branchAccess;
    constructor(kdsService, branchAccess) {
        this.kdsService = kdsService;
        this.branchAccess = branchAccess;
    }
    async listStations(user, branchId) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.kdsService.listStations(branchId);
    }
    async listTickets(user, branchId, stationId) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.kdsService.listActiveTickets(branchId, stationId);
    }
    async listIncoming(user, branchId) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.kdsService.listIncoming(branchId);
    }
    async acceptIncoming(user, branchId, id) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.kdsService.acceptIncoming(branchId, id, user.id);
    }
    async declineIncoming(user, branchId, id, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        const { reason } = body;
        return this.kdsService.declineIncoming(branchId, id, user.id, reason);
    }
    async progress(user, branchId) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.kdsService.progress(branchId);
    }
    async getPerformance(user, branchId, date) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.kdsService.getPerformanceReport(branchId, date);
    }
    async updateStatus(user, branchId, id, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        const { status } = body;
        return this.kdsService.updateStatus(branchId, id, status, user.id);
    }
    async rejectTicket(user, branchId, id, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        const { reason, confirmStarted } = body;
        return this.kdsService.rejectTicket(branchId, id, user.id, {
            reason,
            confirmStarted,
            mayRejectStarted: user.permissions.includes('orders.cancel'),
        });
    }
    async setPriority(user, branchId, id, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        const { isPriority } = body;
        return this.kdsService.setPriority(branchId, id, isPriority);
    }
    async print(user, branchId, id) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.kdsService.print(branchId, id, false);
    }
    async reprint(user, branchId, id) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.kdsService.print(branchId, id, true);
    }
};
exports.KdsController = KdsController;
__decorate([
    (0, auth_decorator_1.Auth)('kds.manage'),
    (0, common_1.Get)('stations'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], KdsController.prototype, "listStations", null);
__decorate([
    (0, auth_decorator_1.Auth)('kds.manage'),
    (0, common_1.Get)('tickets'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('stationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], KdsController.prototype, "listTickets", null);
__decorate([
    (0, auth_decorator_1.Auth)('orders.accept'),
    (0, common_1.Get)('incoming'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], KdsController.prototype, "listIncoming", null);
__decorate([
    (0, auth_decorator_1.Auth)('orders.accept'),
    (0, common_1.Post)('incoming/:id/accept'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], KdsController.prototype, "acceptIncoming", null);
__decorate([
    (0, auth_decorator_1.Auth)('orders.accept'),
    (0, common_1.Post)('incoming/:id/reject'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.rejectOrderSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], KdsController.prototype, "declineIncoming", null);
__decorate([
    (0, auth_decorator_1.Auth)('orders.create'),
    (0, common_1.Get)('progress'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], KdsController.prototype, "progress", null);
__decorate([
    (0, auth_decorator_1.Auth)('kds.manage'),
    (0, common_1.Get)('performance'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], KdsController.prototype, "getPerformance", null);
__decorate([
    (0, auth_decorator_1.Auth)('kds.manage'),
    (0, common_1.Patch)('tickets/:id/status'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.kotItemStatusUpdateSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], KdsController.prototype, "updateStatus", null);
__decorate([
    (0, auth_decorator_1.Auth)('kds.manage'),
    (0, common_1.Post)('tickets/:id/reject'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.rejectKotSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], KdsController.prototype, "rejectTicket", null);
__decorate([
    (0, auth_decorator_1.Auth)('kds.manage'),
    (0, common_1.Patch)('tickets/:id/priority'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.setPrioritySchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], KdsController.prototype, "setPriority", null);
__decorate([
    (0, auth_decorator_1.Auth)('kds.manage'),
    (0, common_1.Post)('tickets/:id/print'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], KdsController.prototype, "print", null);
__decorate([
    (0, auth_decorator_1.Auth)('kds.manage'),
    (0, common_1.Post)('tickets/:id/reprint'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], KdsController.prototype, "reprint", null);
exports.KdsController = KdsController = __decorate([
    (0, swagger_1.ApiTags)('kds'),
    (0, common_1.Controller)('v1/kds'),
    __metadata("design:paramtypes", [kds_service_1.KdsService,
        branch_access_service_1.BranchAccessService])
], KdsController);
//# sourceMappingURL=kds.controller.js.map