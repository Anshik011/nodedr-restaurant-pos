"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationsModule = void 0;
const common_1 = require("@nestjs/common");
const audit_module_1 = require("../audit/audit.module");
const branch_access_service_1 = require("../common/services/branch-access.service");
const integration_api_key_guard_1 = require("../common/guards/integration-api-key.guard");
const delivery_module_1 = require("../modules/delivery/delivery.module");
const orders_module_1 = require("../modules/orders/orders.module");
const reservations_module_1 = require("../modules/reservations/reservations.module");
const integration_api_keys_controller_1 = require("./integration-api-keys.controller");
const integration_api_keys_service_1 = require("./integration-api-keys.service");
const integrations_controller_1 = require("./integrations.controller");
const integrations_service_1 = require("./integrations.service");
const staff_api_keys_controller_1 = require("./staff-api-keys.controller");
const staff_api_keys_service_1 = require("./staff-api-keys.service");
let IntegrationsModule = class IntegrationsModule {
};
exports.IntegrationsModule = IntegrationsModule;
exports.IntegrationsModule = IntegrationsModule = __decorate([
    (0, common_1.Module)({
        imports: [orders_module_1.OrdersModule, reservations_module_1.ReservationsModule, delivery_module_1.DeliveryModule, audit_module_1.AuditModule],
        controllers: [
            integrations_controller_1.IntegrationsController,
            integration_api_keys_controller_1.IntegrationApiKeysController,
            staff_api_keys_controller_1.StaffApiKeysController,
        ],
        providers: [
            integrations_service_1.IntegrationsService,
            integration_api_keys_service_1.IntegrationApiKeysService,
            staff_api_keys_service_1.StaffApiKeysService,
            integration_api_key_guard_1.IntegrationApiKeyGuard,
            branch_access_service_1.BranchAccessService,
        ],
    })
], IntegrationsModule);
//# sourceMappingURL=integrations.module.js.map