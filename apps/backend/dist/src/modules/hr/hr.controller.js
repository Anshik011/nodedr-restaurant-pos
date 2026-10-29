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
exports.HrController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const types_1 = require("@nodedr-restaurant/types");
const auth_decorator_1 = require("../../common/decorators/auth.decorator");
const audit_action_1 = require("../../audit/audit-action");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const branch_access_service_1 = require("../../common/services/branch-access.service");
const hr_service_1 = require("./hr.service");
let HrController = class HrController {
    hr;
    branchAccess;
    constructor(hr, branchAccess) {
        this.hr = hr;
        this.branchAccess = branchAccess;
    }
    access(u, branchId) {
        return this.branchAccess.assertAccess(u.restaurantId, branchId);
    }
    async shifts(u, branchId, from, to) {
        await this.access(u, branchId);
        return this.hr.listShifts(branchId, from, to);
    }
    async myShifts(u, branchId) {
        await this.access(u, branchId);
        return this.hr.listShifts(branchId, new Date().toISOString().slice(0, 10), undefined, u.id);
    }
    async createShift(u, branchId, body) {
        await this.access(u, branchId);
        return this.hr.createShift(branchId, body);
    }
    async deleteShift(u, branchId, id) {
        await this.access(u, branchId);
        return this.hr.deleteShift(branchId, id);
    }
    async requestLeave(u, body) {
        await this.access(u, body.branchId);
        return this.hr.requestLeave(u.id, body);
    }
    myLeave(u) {
        return this.hr.myLeave(u.id);
    }
    async leave(u, branchId, status) {
        await this.access(u, branchId);
        return this.hr.listLeave(branchId, status);
    }
    async decide(u, branchId, id, body) {
        await this.access(u, branchId);
        return this.hr.decideLeave(branchId, id, u.id, body.status);
    }
    async pay(u, branchId) {
        await this.access(u, branchId);
        return this.hr.listPay(branchId);
    }
    async setPay(u, branchId, userId, body) {
        await this.access(u, branchId);
        return this.hr.setPay(branchId, userId, body);
    }
    async runs(u, branchId) {
        await this.access(u, branchId);
        return this.hr.listRuns(branchId);
    }
    async run(u, branchId, id) {
        await this.access(u, branchId);
        return this.hr.getRun(branchId, id);
    }
    async createRun(u, branchId, body) {
        await this.access(u, branchId);
        return this.hr.createRun(branchId, body.periodStart, body.periodEnd);
    }
    async finalize(u, branchId, id) {
        await this.access(u, branchId);
        return this.hr.finalizeRun(branchId, id);
    }
    async deleteRun(u, branchId, id) {
        await this.access(u, branchId);
        return this.hr.deleteRun(branchId, id);
    }
    async performance(u, branchId, from, to) {
        await this.access(u, branchId);
        return this.hr.performance(branchId, from, to);
    }
};
exports.HrController = HrController;
__decorate([
    (0, auth_decorator_1.Auth)('staff.manage'),
    (0, common_1.Get)('shifts'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('from')),
    __param(3, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], HrController.prototype, "shifts", null);
__decorate([
    (0, auth_decorator_1.Auth)(),
    (0, common_1.Get)('shifts/mine'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], HrController.prototype, "myShifts", null);
__decorate([
    (0, auth_decorator_1.Auth)('staff.manage'),
    (0, common_1.Post)('shifts'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.shiftSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], HrController.prototype, "createShift", null);
__decorate([
    (0, auth_decorator_1.Auth)('staff.manage'),
    (0, common_1.Delete)('shifts/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], HrController.prototype, "deleteShift", null);
__decorate([
    (0, auth_decorator_1.Auth)(),
    (0, common_1.Post)('leave'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.leaveRequestSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], HrController.prototype, "requestLeave", null);
__decorate([
    (0, auth_decorator_1.Auth)(),
    (0, common_1.Get)('leave/mine'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "myLeave", null);
__decorate([
    (0, auth_decorator_1.Auth)('staff.manage'),
    (0, common_1.Get)('leave'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], HrController.prototype, "leave", null);
__decorate([
    (0, auth_decorator_1.Auth)('staff.manage'),
    (0, audit_action_1.AuditAction)('leave.decided', 'LeaveRequest'),
    (0, common_1.Patch)('leave/:id'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.leaveDecisionSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], HrController.prototype, "decide", null);
__decorate([
    (0, auth_decorator_1.Auth)('staff.manage'),
    (0, common_1.Get)('pay'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], HrController.prototype, "pay", null);
__decorate([
    (0, auth_decorator_1.Auth)('staff.manage'),
    (0, audit_action_1.AuditAction)('hr.pay_set', 'User'),
    (0, common_1.Put)('pay/:userId'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.staffPaySchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('userId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], HrController.prototype, "setPay", null);
__decorate([
    (0, auth_decorator_1.Auth)('staff.manage'),
    (0, common_1.Get)('payroll'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], HrController.prototype, "runs", null);
__decorate([
    (0, auth_decorator_1.Auth)('staff.manage'),
    (0, common_1.Get)('payroll/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], HrController.prototype, "run", null);
__decorate([
    (0, auth_decorator_1.Auth)('staff.manage'),
    (0, audit_action_1.AuditAction)('payroll.created', 'PayrollRun'),
    (0, common_1.Post)('payroll'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.payrollRunSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], HrController.prototype, "createRun", null);
__decorate([
    (0, auth_decorator_1.Auth)('staff.manage'),
    (0, audit_action_1.AuditAction)('payroll.finalized', 'PayrollRun'),
    (0, common_1.Post)('payroll/:id/finalize'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], HrController.prototype, "finalize", null);
__decorate([
    (0, auth_decorator_1.Auth)('staff.manage'),
    (0, audit_action_1.AuditAction)('payroll.deleted', 'PayrollRun'),
    (0, common_1.Delete)('payroll/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], HrController.prototype, "deleteRun", null);
__decorate([
    (0, auth_decorator_1.Auth)('staff.manage'),
    (0, common_1.Get)('performance'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('from')),
    __param(3, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], HrController.prototype, "performance", null);
exports.HrController = HrController = __decorate([
    (0, swagger_1.ApiTags)('hr'),
    (0, common_1.Controller)('v1/hr'),
    __metadata("design:paramtypes", [hr_service_1.HrService,
        branch_access_service_1.BranchAccessService])
], HrController);
//# sourceMappingURL=hr.controller.js.map