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
exports.IntegrationApiKeysController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const types_1 = require("@nodedr-restaurant/types");
const auth_decorator_1 = require("../common/decorators/auth.decorator");
const audit_action_1 = require("../audit/audit-action");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const zod_validation_pipe_1 = require("../common/pipes/zod-validation.pipe");
const integration_api_keys_service_1 = require("./integration-api-keys.service");
let IntegrationApiKeysController = class IntegrationApiKeysController {
    integrationApiKeys;
    constructor(integrationApiKeys) {
        this.integrationApiKeys = integrationApiKeys;
    }
    list(user) {
        return this.integrationApiKeys.list(user);
    }
    create(user, body) {
        return this.integrationApiKeys.create(user, body);
    }
    revoke(user, id) {
        return this.integrationApiKeys.revoke(user, id);
    }
};
exports.IntegrationApiKeysController = IntegrationApiKeysController;
__decorate([
    (0, auth_decorator_1.Auth)('settings.manage'),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IntegrationApiKeysController.prototype, "list", null);
__decorate([
    (0, auth_decorator_1.Auth)('settings.manage'),
    (0, audit_action_1.AuditAction)('api_key.integration_created', 'IntegrationApiKey'),
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.createIntegrationApiKeySchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], IntegrationApiKeysController.prototype, "create", null);
__decorate([
    (0, auth_decorator_1.Auth)('settings.manage'),
    (0, audit_action_1.AuditAction)('api_key.integration_revoked', 'IntegrationApiKey'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], IntegrationApiKeysController.prototype, "revoke", null);
exports.IntegrationApiKeysController = IntegrationApiKeysController = __decorate([
    (0, swagger_1.ApiTags)('integrations'),
    (0, common_1.Controller)('v1/integration-api-keys'),
    __metadata("design:paramtypes", [integration_api_keys_service_1.IntegrationApiKeysService])
], IntegrationApiKeysController);
//# sourceMappingURL=integration-api-keys.controller.js.map