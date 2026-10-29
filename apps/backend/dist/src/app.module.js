"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_exception_filter_1 = require("./common/filters/prisma-exception.filter");
const auth_module_1 = require("./auth/auth.module");
const prisma_module_1 = require("./prisma/prisma.module");
const realtime_module_1 = require("./realtime/realtime.module");
const menu_module_1 = require("./modules/menu/menu.module");
const attendance_module_1 = require("./modules/attendance/attendance.module");
const delivery_module_1 = require("./modules/delivery/delivery.module");
const hr_module_1 = require("./modules/hr/hr.module");
const accounting_module_1 = require("./modules/accounting/accounting.module");
const marketing_module_1 = require("./modules/marketing/marketing.module");
const reports_module_1 = require("./modules/reports/reports.module");
const operations_module_1 = require("./modules/operations/operations.module");
const webhooks_module_1 = require("./modules/webhooks/webhooks.module");
const email_module_1 = require("./modules/email/email.module");
const tables_module_1 = require("./modules/tables/tables.module");
const orders_module_1 = require("./modules/orders/orders.module");
const kds_module_1 = require("./modules/kds/kds.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const restaurants_module_1 = require("./modules/restaurants/restaurants.module");
const reservations_module_1 = require("./modules/reservations/reservations.module");
const waitlist_module_1 = require("./modules/waitlist/waitlist.module");
const public_module_1 = require("./modules/public/public.module");
const downloads_module_1 = require("./modules/downloads/downloads.module");
const customers_module_1 = require("./modules/customers/customers.module");
const gift_cards_module_1 = require("./modules/gift-cards/gift-cards.module");
const inventory_module_1 = require("./modules/inventory/inventory.module");
const settings_module_1 = require("./modules/settings/settings.module");
const sync_module_1 = require("./sync/sync.module");
const users_module_1 = require("./modules/users/users.module");
const permissions_module_1 = require("./permissions/permissions.module");
const audit_module_1 = require("./audit/audit.module");
const roles_module_1 = require("./roles/roles.module");
const notifications_module_1 = require("./notifications/notifications.module");
const backup_module_1 = require("./backup/backup.module");
const integrations_module_1 = require("./integrations/integrations.module");
const mcp_module_1 = require("./mcp/mcp.module");
const system_module_1 = require("./system/system.module");
const verifactu_module_1 = require("./modules/verifactu/verifactu.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            schedule_1.ScheduleModule.forRoot(),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }]),
            prisma_module_1.PrismaModule,
            realtime_module_1.RealtimeModule,
            auth_module_1.AuthModule,
            menu_module_1.MenuModule,
            tables_module_1.TablesModule,
            attendance_module_1.AttendanceModule,
            delivery_module_1.DeliveryModule,
            hr_module_1.HrModule,
            accounting_module_1.AccountingModule,
            marketing_module_1.MarketingModule,
            reports_module_1.ReportsModule,
            operations_module_1.OperationsModule,
            webhooks_module_1.WebhooksModule,
            email_module_1.EmailModule,
            orders_module_1.OrdersModule,
            kds_module_1.KdsModule,
            dashboard_module_1.DashboardModule,
            restaurants_module_1.RestaurantsModule,
            reservations_module_1.ReservationsModule,
            waitlist_module_1.WaitlistModule,
            public_module_1.PublicModule,
            downloads_module_1.DownloadsModule,
            customers_module_1.CustomersModule,
            gift_cards_module_1.GiftCardsModule,
            inventory_module_1.InventoryModule,
            settings_module_1.SettingsModule,
            sync_module_1.SyncModule,
            verifactu_module_1.VerifactuModule,
            users_module_1.UsersModule,
            permissions_module_1.PermissionsModule,
            audit_module_1.AuditModule,
            roles_module_1.RolesModule,
            notifications_module_1.NotificationsModule,
            backup_module_1.BackupModule,
            integrations_module_1.IntegrationsModule,
            mcp_module_1.McpModule,
            system_module_1.SystemModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
            { provide: core_1.APP_FILTER, useClass: prisma_exception_filter_1.PrismaExceptionFilter },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map