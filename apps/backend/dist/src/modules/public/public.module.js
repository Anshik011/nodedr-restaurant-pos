"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicModule = void 0;
const common_1 = require("@nestjs/common");
const notifications_module_1 = require("../../notifications/notifications.module");
const orders_module_1 = require("../orders/orders.module");
const public_kiosk_controller_1 = require("./public-kiosk.controller");
const public_kiosk_service_1 = require("./public-kiosk.service");
const public_menu_controller_1 = require("./public-menu.controller");
const public_menu_service_1 = require("./public-menu.service");
let PublicModule = class PublicModule {
};
exports.PublicModule = PublicModule;
exports.PublicModule = PublicModule = __decorate([
    (0, common_1.Module)({
        imports: [orders_module_1.OrdersModule, notifications_module_1.NotificationsModule],
        controllers: [public_menu_controller_1.PublicMenuController, public_kiosk_controller_1.PublicKioskController],
        providers: [public_menu_service_1.PublicMenuService, public_kiosk_service_1.PublicKioskService],
    })
], PublicModule);
//# sourceMappingURL=public.module.js.map