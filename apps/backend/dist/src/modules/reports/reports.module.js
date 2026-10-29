"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsModule = void 0;
const common_1 = require("@nestjs/common");
const audit_module_1 = require("../../audit/audit.module");
const branch_access_service_1 = require("../../common/services/branch-access.service");
const branch_time_service_1 = require("../../common/services/branch-time.service");
const accounting_module_1 = require("../accounting/accounting.module");
const report_schedules_controller_1 = require("./report-schedules.controller");
const report_schedules_service_1 = require("./report-schedules.service");
const reports_controller_1 = require("./reports.controller");
const reports_service_1 = require("./reports.service");
let ReportsModule = class ReportsModule {
};
exports.ReportsModule = ReportsModule;
exports.ReportsModule = ReportsModule = __decorate([
    (0, common_1.Module)({
        imports: [accounting_module_1.AccountingModule, audit_module_1.AuditModule],
        controllers: [reports_controller_1.ReportsController, report_schedules_controller_1.ReportSchedulesController],
        providers: [
            reports_service_1.ReportsService,
            report_schedules_service_1.ReportSchedulesService,
            branch_access_service_1.BranchAccessService,
            branch_time_service_1.BranchTimeService,
        ],
        exports: [reports_service_1.ReportsService],
    })
], ReportsModule);
//# sourceMappingURL=reports.module.js.map