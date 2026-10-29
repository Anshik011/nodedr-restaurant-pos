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
exports.WebhooksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const zod_1 = require("zod");
const auth_decorator_1 = require("../../common/decorators/auth.decorator");
const audit_action_1 = require("../../audit/audit-action");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const webhooks_service_1 = require("./webhooks.service");
const createSchema = zod_1.z.object({
    url: zod_1.z.string().trim().url().max(500),
    events: zod_1.z.array(zod_1.z.string()).min(1),
    description: zod_1.z.string().trim().max(120).optional(),
});
let WebhooksController = class WebhooksController {
    webhooks;
    constructor(webhooks) {
        this.webhooks = webhooks;
    }
    events() {
        return webhooks_service_1.WEBHOOK_EVENTS;
    }
    list(u) {
        return this.webhooks.list(u.restaurantId);
    }
    create(u, body) {
        return this.webhooks.create(u.restaurantId, body);
    }
    setActive(u, id, body) {
        return this.webhooks.setActive(u.restaurantId, id, !!body.isActive);
    }
    remove(u, id) {
        return this.webhooks.remove(u.restaurantId, id);
    }
    deliveries(u, id) {
        return this.webhooks.deliveries(u.restaurantId, id);
    }
    test(u, id) {
        return this.webhooks.sendTest(u.restaurantId, id);
    }
};
exports.WebhooksController = WebhooksController;
__decorate([
    (0, auth_decorator_1.Auth)('settings.manage'),
    (0, common_1.Get)('events'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WebhooksController.prototype, "events", null);
__decorate([
    (0, auth_decorator_1.Auth)('settings.manage'),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WebhooksController.prototype, "list", null);
__decorate([
    (0, auth_decorator_1.Auth)('settings.manage'),
    (0, audit_action_1.AuditAction)('webhook.created', 'WebhookEndpoint'),
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(createSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], WebhooksController.prototype, "create", null);
__decorate([
    (0, auth_decorator_1.Auth)('settings.manage'),
    (0, audit_action_1.AuditAction)('webhook.toggled', 'WebhookEndpoint'),
    (0, common_1.Patch)(':id/active'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], WebhooksController.prototype, "setActive", null);
__decorate([
    (0, auth_decorator_1.Auth)('settings.manage'),
    (0, audit_action_1.AuditAction)('webhook.deleted', 'WebhookEndpoint'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WebhooksController.prototype, "remove", null);
__decorate([
    (0, auth_decorator_1.Auth)('settings.manage'),
    (0, common_1.Get)(':id/deliveries'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WebhooksController.prototype, "deliveries", null);
__decorate([
    (0, auth_decorator_1.Auth)('settings.manage'),
    (0, common_1.Post)(':id/test'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WebhooksController.prototype, "test", null);
exports.WebhooksController = WebhooksController = __decorate([
    (0, swagger_1.ApiTags)('webhooks'),
    (0, common_1.Controller)('v1/webhooks'),
    __metadata("design:paramtypes", [webhooks_service_1.WebhooksService])
], WebhooksController);
//# sourceMappingURL=webhooks.controller.js.map