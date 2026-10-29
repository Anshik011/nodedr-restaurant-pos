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
exports.PublicMenuController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const types_1 = require("@nodedr-restaurant/types");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const public_menu_service_1 = require("./public-menu.service");
let PublicMenuController = class PublicMenuController {
    publicMenuService;
    constructor(publicMenuService) {
        this.publicMenuService = publicMenuService;
    }
    getMenu(qrToken) {
        return this.publicMenuService.getMenuByQrToken(qrToken);
    }
    createOrder(qrToken, body) {
        const { items, guestName } = body;
        return this.publicMenuService.createOrder(qrToken, items, guestName);
    }
    getStatus(qrToken) {
        return this.publicMenuService.getStatus(qrToken);
    }
    createRequest(qrToken, body) {
        return this.publicMenuService.createRequest(qrToken, body.type);
    }
};
exports.PublicMenuController = PublicMenuController;
__decorate([
    (0, common_1.Get)('menu/:qrToken'),
    __param(0, (0, common_1.Param)('qrToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicMenuController.prototype, "getMenu", null);
__decorate([
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60_000 } }),
    (0, common_1.Post)('menu/:qrToken/order'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.publicOrderSchema)),
    __param(0, (0, common_1.Param)('qrToken')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PublicMenuController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Get)('menu/:qrToken/status'),
    __param(0, (0, common_1.Param)('qrToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicMenuController.prototype, "getStatus", null);
__decorate([
    (0, throttler_1.Throttle)({ default: { limit: 6, ttl: 60_000 } }),
    (0, common_1.Post)('menu/:qrToken/request'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.publicRequestSchema)),
    __param(0, (0, common_1.Param)('qrToken')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PublicMenuController.prototype, "createRequest", null);
exports.PublicMenuController = PublicMenuController = __decorate([
    (0, swagger_1.ApiTags)('public'),
    (0, common_1.Controller)('v1/public'),
    __metadata("design:paramtypes", [public_menu_service_1.PublicMenuService])
], PublicMenuController);
//# sourceMappingURL=public-menu.controller.js.map