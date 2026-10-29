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
exports.DeliveryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const types_1 = require("@nodedr-restaurant/types");
const auth_decorator_1 = require("../../common/decorators/auth.decorator");
const audit_action_1 = require("../../audit/audit-action");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const branch_access_service_1 = require("../../common/services/branch-access.service");
const delivery_service_1 = require("./delivery.service");
let DeliveryController = class DeliveryController {
    delivery;
    branchAccess;
    constructor(delivery, branchAccess) {
        this.delivery = delivery;
        this.branchAccess = branchAccess;
    }
    async zones(u, branchId) {
        await this.branchAccess.assertAccess(u.restaurantId, branchId);
        return this.delivery.listZones(branchId);
    }
    async createZone(u, branchId, body) {
        await this.branchAccess.assertAccess(u.restaurantId, branchId);
        return this.delivery.createZone(branchId, body);
    }
    async updateZone(u, branchId, id, body) {
        await this.branchAccess.assertAccess(u.restaurantId, branchId);
        return this.delivery.updateZone(branchId, id, body);
    }
    async deleteZone(u, branchId, id) {
        await this.branchAccess.assertAccess(u.restaurantId, branchId);
        return this.delivery.deleteZone(branchId, id);
    }
    async drivers(u, branchId) {
        await this.branchAccess.assertAccess(u.restaurantId, branchId);
        return this.delivery.listDrivers(branchId);
    }
    async list(u, branchId, history) {
        await this.branchAccess.assertAccess(u.restaurantId, branchId);
        return this.delivery.list(branchId, history === 'true');
    }
    async assign(u, branchId, orderId, body) {
        await this.branchAccess.assertAccess(u.restaurantId, branchId);
        return this.delivery.assignDriver(branchId, orderId, body.driverId);
    }
    async status(u, branchId, orderId, body) {
        await this.branchAccess.assertAccess(u.restaurantId, branchId);
        return this.delivery.setStatus(branchId, orderId, body.status);
    }
};
exports.DeliveryController = DeliveryController;
__decorate([
    (0, auth_decorator_1.Auth)('delivery.manage'),
    (0, common_1.Get)('zones'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "zones", null);
__decorate([
    (0, auth_decorator_1.Auth)('delivery.manage'),
    (0, audit_action_1.AuditAction)('delivery_zone.created', 'DeliveryZone'),
    (0, common_1.Post)('zones'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.deliveryZoneSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, void 0]),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "createZone", null);
__decorate([
    (0, auth_decorator_1.Auth)('delivery.manage'),
    (0, audit_action_1.AuditAction)('delivery_zone.updated', 'DeliveryZone'),
    (0, common_1.Patch)('zones/:id'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.deliveryZoneUpdateSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, void 0]),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "updateZone", null);
__decorate([
    (0, auth_decorator_1.Auth)('delivery.manage'),
    (0, audit_action_1.AuditAction)('delivery_zone.deleted', 'DeliveryZone'),
    (0, common_1.Delete)('zones/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "deleteZone", null);
__decorate([
    (0, auth_decorator_1.Auth)('delivery.manage'),
    (0, common_1.Get)('drivers'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "drivers", null);
__decorate([
    (0, auth_decorator_1.Auth)('delivery.manage'),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('history')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "list", null);
__decorate([
    (0, auth_decorator_1.Auth)('delivery.manage'),
    (0, audit_action_1.AuditAction)('delivery.driver_assigned', 'Order'),
    (0, common_1.Patch)(':orderId/assign'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.assignDriverSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('orderId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "assign", null);
__decorate([
    (0, auth_decorator_1.Auth)('delivery.manage'),
    (0, common_1.Patch)(':orderId/status'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.deliveryStatusUpdateSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('orderId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "status", null);
exports.DeliveryController = DeliveryController = __decorate([
    (0, swagger_1.ApiTags)('delivery'),
    (0, common_1.Controller)('v1/delivery'),
    __metadata("design:paramtypes", [delivery_service_1.DeliveryService,
        branch_access_service_1.BranchAccessService])
], DeliveryController);
//# sourceMappingURL=delivery.controller.js.map