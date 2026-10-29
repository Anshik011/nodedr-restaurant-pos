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
exports.PublicKioskController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const types_1 = require("@nodedr-restaurant/types");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const public_kiosk_service_1 = require("./public-kiosk.service");
let PublicKioskController = class PublicKioskController {
    kiosk;
    constructor(kiosk) {
        this.kiosk = kiosk;
    }
    getMenu(kioskToken) {
        return this.kiosk.getMenu(kioskToken);
    }
    createOrder(kioskToken, body) {
        return this.kiosk.createOrder(kioskToken, body);
    }
};
exports.PublicKioskController = PublicKioskController;
__decorate([
    (0, throttler_1.Throttle)({ default: { limit: 60, ttl: 60_000 } }),
    (0, common_1.Get)(':kioskToken'),
    __param(0, (0, common_1.Param)('kioskToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicKioskController.prototype, "getMenu", null);
__decorate([
    (0, throttler_1.Throttle)({ default: { limit: 20, ttl: 60_000 } }),
    (0, common_1.Post)(':kioskToken/order'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.kioskOrderSchema)),
    __param(0, (0, common_1.Param)('kioskToken')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PublicKioskController.prototype, "createOrder", null);
exports.PublicKioskController = PublicKioskController = __decorate([
    (0, swagger_1.ApiTags)('public'),
    (0, common_1.Controller)('v1/public/kiosk'),
    __metadata("design:paramtypes", [public_kiosk_service_1.PublicKioskService])
], PublicKioskController);
//# sourceMappingURL=public-kiosk.controller.js.map