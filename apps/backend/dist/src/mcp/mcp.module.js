"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpModule = void 0;
const common_1 = require("@nestjs/common");
const branch_access_service_1 = require("../common/services/branch-access.service");
const staff_api_key_guard_1 = require("../common/guards/staff-api-key.guard");
const orders_module_1 = require("../modules/orders/orders.module");
const reservations_module_1 = require("../modules/reservations/reservations.module");
const dashboard_module_1 = require("../modules/dashboard/dashboard.module");
const menu_module_1 = require("../modules/menu/menu.module");
const tables_module_1 = require("../modules/tables/tables.module");
const delivery_module_1 = require("../modules/delivery/delivery.module");
const accounting_module_1 = require("../modules/accounting/accounting.module");
const hr_module_1 = require("../modules/hr/hr.module");
const marketing_module_1 = require("../modules/marketing/marketing.module");
const operations_module_1 = require("../modules/operations/operations.module");
const reports_module_1 = require("../modules/reports/reports.module");
const attendance_module_1 = require("../modules/attendance/attendance.module");
const mcp_controller_1 = require("./mcp.controller");
const mcp_tools_builder_1 = require("./mcp-tools.builder");
let McpModule = class McpModule {
};
exports.McpModule = McpModule;
exports.McpModule = McpModule = __decorate([
    (0, common_1.Module)({
        imports: [
            orders_module_1.OrdersModule,
            reservations_module_1.ReservationsModule,
            dashboard_module_1.DashboardModule,
            menu_module_1.MenuModule,
            tables_module_1.TablesModule,
            attendance_module_1.AttendanceModule,
            delivery_module_1.DeliveryModule,
            hr_module_1.HrModule,
            accounting_module_1.AccountingModule,
            reports_module_1.ReportsModule,
            marketing_module_1.MarketingModule,
            operations_module_1.OperationsModule,
        ],
        controllers: [mcp_controller_1.McpController],
        providers: [mcp_tools_builder_1.McpToolsBuilder, staff_api_key_guard_1.StaffApiKeyGuard, branch_access_service_1.BranchAccessService],
    })
], McpModule);
//# sourceMappingURL=mcp.module.js.map