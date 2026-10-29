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
exports.AccountingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const types_1 = require("@nodedr-restaurant/types");
const auth_decorator_1 = require("../../common/decorators/auth.decorator");
const audit_action_1 = require("../../audit/audit-action");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const branch_access_service_1 = require("../../common/services/branch-access.service");
const accounting_service_1 = require("./accounting.service");
let AccountingController = class AccountingController {
    accounting;
    branchAccess;
    constructor(accounting, branchAccess) {
        this.accounting = accounting;
        this.branchAccess = branchAccess;
    }
    access(u, branchId) {
        return this.branchAccess.assertAccess(u.restaurantId, branchId);
    }
    async expenses(u, branchId, from, to) {
        await this.access(u, branchId);
        return this.accounting.listExpenses(branchId, from, to);
    }
    async createExpense(u, branchId, body) {
        await this.access(u, branchId);
        return this.accounting.createExpense(branchId, u.id, body);
    }
    async deleteExpense(u, branchId, id) {
        await this.access(u, branchId);
        return this.accounting.deleteExpense(branchId, id);
    }
    async preview(u, branchId, date, openingFloat) {
        await this.access(u, branchId);
        return this.accounting.closingPreview(branchId, date, Number(openingFloat ?? 0) || 0);
    }
    async closings(u, branchId) {
        await this.access(u, branchId);
        return this.accounting.listClosings(branchId);
    }
    async close(u, branchId, body) {
        await this.access(u, branchId);
        return this.accounting.closeDay(branchId, u.id, body);
    }
    async pnl(u, branchId, from, to) {
        await this.access(u, branchId);
        return this.accounting.profitAndLoss(branchId, from, to);
    }
    async gst(u, branchId, from, to) {
        await this.access(u, branchId);
        return this.accounting.gstReport(branchId, from, to);
    }
    branches(u, from, to) {
        return this.accounting.branchOverview(u.restaurantId, from, to);
    }
};
exports.AccountingController = AccountingController;
__decorate([
    (0, auth_decorator_1.Auth)('accounting.manage'),
    (0, common_1.Get)('expenses'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('from')),
    __param(3, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], AccountingController.prototype, "expenses", null);
__decorate([
    (0, auth_decorator_1.Auth)('accounting.manage'),
    (0, audit_action_1.AuditAction)('expense.created', 'Expense'),
    (0, common_1.Post)('expenses'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.expenseSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AccountingController.prototype, "createExpense", null);
__decorate([
    (0, auth_decorator_1.Auth)('accounting.manage'),
    (0, audit_action_1.AuditAction)('expense.deleted', 'Expense'),
    (0, common_1.Delete)('expenses/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AccountingController.prototype, "deleteExpense", null);
__decorate([
    (0, auth_decorator_1.Auth)('accounting.manage'),
    (0, common_1.Get)('closing/preview'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('date')),
    __param(3, (0, common_1.Query)('openingFloat')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], AccountingController.prototype, "preview", null);
__decorate([
    (0, auth_decorator_1.Auth)('accounting.manage'),
    (0, common_1.Get)('closing'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AccountingController.prototype, "closings", null);
__decorate([
    (0, auth_decorator_1.Auth)('accounting.manage'),
    (0, audit_action_1.AuditAction)('cash.closed', 'CashClosing'),
    (0, common_1.Post)('closing'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.cashClosingSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AccountingController.prototype, "close", null);
__decorate([
    (0, auth_decorator_1.Auth)('accounting.manage'),
    (0, common_1.Get)('profit-loss'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('from')),
    __param(3, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], AccountingController.prototype, "pnl", null);
__decorate([
    (0, auth_decorator_1.Auth)('accounting.manage'),
    (0, common_1.Get)('gst'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('from')),
    __param(3, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], AccountingController.prototype, "gst", null);
__decorate([
    (0, auth_decorator_1.Auth)('accounting.manage'),
    (0, common_1.Get)('branches'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "branches", null);
exports.AccountingController = AccountingController = __decorate([
    (0, swagger_1.ApiTags)('accounting'),
    (0, common_1.Controller)('v1/accounting'),
    __metadata("design:paramtypes", [accounting_service_1.AccountingService,
        branch_access_service_1.BranchAccessService])
], AccountingController);
//# sourceMappingURL=accounting.controller.js.map