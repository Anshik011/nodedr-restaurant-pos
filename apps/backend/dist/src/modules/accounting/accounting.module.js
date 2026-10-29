"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountingModule = void 0;
const common_1 = require("@nestjs/common");
const audit_module_1 = require("../../audit/audit.module");
const branch_access_service_1 = require("../../common/services/branch-access.service");
const branch_time_service_1 = require("../../common/services/branch-time.service");
const accounting_controller_1 = require("./accounting.controller");
const accounting_service_1 = require("./accounting.service");
const ledger_controller_1 = require("./ledger.controller");
const ledger_service_1 = require("./ledger.service");
let AccountingModule = class AccountingModule {
};
exports.AccountingModule = AccountingModule;
exports.AccountingModule = AccountingModule = __decorate([
    (0, common_1.Module)({
        imports: [audit_module_1.AuditModule],
        controllers: [accounting_controller_1.AccountingController, ledger_controller_1.LedgerController],
        providers: [
            accounting_service_1.AccountingService,
            ledger_service_1.LedgerService,
            branch_access_service_1.BranchAccessService,
            branch_time_service_1.BranchTimeService,
        ],
        exports: [accounting_service_1.AccountingService],
    })
], AccountingModule);
//# sourceMappingURL=accounting.module.js.map