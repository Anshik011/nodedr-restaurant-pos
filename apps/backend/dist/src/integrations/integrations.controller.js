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
exports.IntegrationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const types_1 = require("@nodedr-restaurant/types");
const current_integration_key_decorator_1 = require("../common/decorators/current-integration-key.decorator");
const require_scope_decorator_1 = require("../common/decorators/require-scope.decorator");
const integration_api_key_guard_1 = require("../common/guards/integration-api-key.guard");
const zod_validation_pipe_1 = require("../common/pipes/zod-validation.pipe");
const integrations_service_1 = require("./integrations.service");
let IntegrationsController = class IntegrationsController {
    integrations;
    constructor(integrations) {
        this.integrations = integrations;
    }
    listLocations(key) {
        return this.integrations.listLocations(key);
    }
    getMenu(key, branchId) {
        return this.integrations.getMenu(key, branchId);
    }
    deliveryQuote(key, branchId, pincode) {
        return this.integrations.deliveryQuote(key, branchId, pincode ?? '');
    }
    createOrder(key, branchId, body) {
        return this.integrations.createOrder(key, branchId, body);
    }
    getOrder(key, branchId, orderId) {
        return this.integrations.getOrder(key, branchId, orderId);
    }
    createReservation(key, branchId, body) {
        return this.integrations.createReservation(key, branchId, body);
    }
    getReservation(key, branchId, reservationId) {
        return this.integrations.getReservation(key, branchId, reservationId);
    }
};
exports.IntegrationsController = IntegrationsController;
__decorate([
    (0, require_scope_decorator_1.RequireScope)('locations:read'),
    (0, common_1.Get)('locations'),
    __param(0, (0, current_integration_key_decorator_1.CurrentIntegrationKey)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "listLocations", null);
__decorate([
    (0, require_scope_decorator_1.RequireScope)('menu:read'),
    (0, common_1.Get)('locations/:branchId/menu'),
    __param(0, (0, current_integration_key_decorator_1.CurrentIntegrationKey)()),
    __param(1, (0, common_1.Param)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "getMenu", null);
__decorate([
    (0, require_scope_decorator_1.RequireScope)('menu:read'),
    (0, common_1.Get)('locations/:branchId/delivery-quote'),
    __param(0, (0, current_integration_key_decorator_1.CurrentIntegrationKey)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Query)('pincode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "deliveryQuote", null);
__decorate([
    (0, require_scope_decorator_1.RequireScope)('orders:write'),
    (0, throttler_1.Throttle)({ default: { limit: 60, ttl: 60_000 } }),
    (0, common_1.Post)('locations/:branchId/orders'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.createIntegrationOrderSchema)),
    __param(0, (0, current_integration_key_decorator_1.CurrentIntegrationKey)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "createOrder", null);
__decorate([
    (0, require_scope_decorator_1.RequireScope)('orders:read'),
    (0, common_1.Get)('locations/:branchId/orders/:orderId'),
    __param(0, (0, current_integration_key_decorator_1.CurrentIntegrationKey)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "getOrder", null);
__decorate([
    (0, require_scope_decorator_1.RequireScope)('reservations:write'),
    (0, throttler_1.Throttle)({ default: { limit: 60, ttl: 60_000 } }),
    (0, common_1.Post)('locations/:branchId/reservations'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.createIntegrationReservationSchema)),
    __param(0, (0, current_integration_key_decorator_1.CurrentIntegrationKey)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "createReservation", null);
__decorate([
    (0, require_scope_decorator_1.RequireScope)('reservations:read'),
    (0, common_1.Get)('locations/:branchId/reservations/:reservationId'),
    __param(0, (0, current_integration_key_decorator_1.CurrentIntegrationKey)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Param)('reservationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "getReservation", null);
exports.IntegrationsController = IntegrationsController = __decorate([
    (0, swagger_1.ApiTags)('integrations'),
    (0, common_1.UseGuards)(integration_api_key_guard_1.IntegrationApiKeyGuard),
    (0, common_1.Controller)('v1/integrations'),
    __metadata("design:paramtypes", [integrations_service_1.IntegrationsService])
], IntegrationsController);
//# sourceMappingURL=integrations.controller.js.map