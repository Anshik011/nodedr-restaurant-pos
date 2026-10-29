"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersModule = void 0;
const common_1 = require("@nestjs/common");
const audit_module_1 = require("../../audit/audit.module");
const branch_access_service_1 = require("../../common/services/branch-access.service");
const notifications_module_1 = require("../../notifications/notifications.module");
const gift_cards_module_1 = require("../gift-cards/gift-cards.module");
const inventory_module_1 = require("../inventory/inventory.module");
const marketing_module_1 = require("../marketing/marketing.module");
const verifactu_module_1 = require("../verifactu/verifactu.module");
const kot_print_service_1 = require("./kot-print.service");
const orders_controller_1 = require("./orders.controller");
const orders_service_1 = require("./orders.service");
const scheduled_orders_service_1 = require("./scheduled-orders.service");
let OrdersModule = class OrdersModule {
};
exports.OrdersModule = OrdersModule;
exports.OrdersModule = OrdersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            gift_cards_module_1.GiftCardsModule,
            inventory_module_1.InventoryModule,
            audit_module_1.AuditModule,
            notifications_module_1.NotificationsModule,
            marketing_module_1.MarketingModule,
            verifactu_module_1.VerifactuModule,
        ],
        controllers: [orders_controller_1.OrdersController],
        providers: [
            orders_service_1.OrdersService,
            kot_print_service_1.KotPrintService,
            scheduled_orders_service_1.ScheduledOrdersService,
            branch_access_service_1.BranchAccessService,
        ],
        exports: [orders_service_1.OrdersService, kot_print_service_1.KotPrintService],
    })
], OrdersModule);
//# sourceMappingURL=orders.module.js.map