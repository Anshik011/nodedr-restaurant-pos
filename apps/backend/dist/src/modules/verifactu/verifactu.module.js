"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifactuModule = void 0;
const common_1 = require("@nestjs/common");
const audit_module_1 = require("../../audit/audit.module");
const branch_access_service_1 = require("../../common/services/branch-access.service");
const verifactu_controller_1 = require("./verifactu.controller");
const verifactu_service_1 = require("./verifactu.service");
let VerifactuModule = class VerifactuModule {
};
exports.VerifactuModule = VerifactuModule;
exports.VerifactuModule = VerifactuModule = __decorate([
    (0, common_1.Module)({
        imports: [audit_module_1.AuditModule],
        controllers: [verifactu_controller_1.VerifactuController],
        providers: [verifactu_service_1.VerifactuService, branch_access_service_1.BranchAccessService],
        exports: [verifactu_service_1.VerifactuService],
    })
], VerifactuModule);
//# sourceMappingURL=verifactu.module.js.map