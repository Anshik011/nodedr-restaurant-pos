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
exports.LedgerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const zod_1 = require("zod");
const audit_action_1 = require("../../audit/audit-action");
const auth_decorator_1 = require("../../common/decorators/auth.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const branch_access_service_1 = require("../../common/services/branch-access.service");
const ledger_service_1 = require("./ledger.service");
const budgetSchema = zod_1.z.object({
    month: zod_1.z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
    category: zod_1.z.string().trim().min(1).max(60),
    amount: zod_1.z.coerce.number().min(0).max(1_000_000_000),
});
const importSchema = zod_1.z.object({ csv: zod_1.z.string().min(10).max(2_000_000) });
const statusSchema = zod_1.z.object({ status: zod_1.z.enum(['UNMATCHED', 'IGNORED']) });
const matchSchema = zod_1.z.object({ expenseId: zod_1.z.string().min(1) });
let LedgerController = class LedgerController {
    ledger;
    branchAccess;
    constructor(ledger, branchAccess) {
        this.ledger = ledger;
        this.branchAccess = branchAccess;
    }
    access(u, branchId) {
        return this.branchAccess.assertAccess(u.restaurantId, branchId);
    }
    async budgets(u, branchId, month) {
        await this.access(u, branchId);
        return this.ledger.budgetVsActual(branchId, month);
    }
    async saveBudget(u, branchId, body) {
        await this.access(u, branchId);
        return this.ledger.setBudget(branchId, body);
    }
    async deleteBudget(u, branchId, id) {
        await this.access(u, branchId);
        return this.ledger.deleteBudget(branchId, id);
    }
    async bank(u, branchId, from, to) {
        await this.access(u, branchId);
        return this.ledger.reconciliation(branchId, from, to);
    }
    async importBank(u, branchId, body) {
        await this.access(u, branchId);
        return this.ledger.importStatement(branchId, body.csv);
    }
    async autoMatch(u, branchId) {
        await this.access(u, branchId);
        return { matched: await this.ledger.autoMatch(branchId) };
    }
    async candidates(u, branchId, id) {
        await this.access(u, branchId);
        return this.ledger.matchCandidates(branchId, id);
    }
    async match(u, branchId, id, body) {
        await this.access(u, branchId);
        return this.ledger.matchManually(branchId, id, body.expenseId);
    }
    async setStatus(u, branchId, id, body) {
        await this.access(u, branchId);
        return this.ledger.setBankStatus(branchId, id, body.status);
    }
    async balanceSheet(u, branchId, asOf) {
        await this.access(u, branchId);
        return this.ledger.balanceSheet(branchId, asOf);
    }
};
exports.LedgerController = LedgerController;
__decorate([
    (0, auth_decorator_1.Auth)('accounting.manage'),
    (0, common_1.Get)('budgets'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], LedgerController.prototype, "budgets", null);
__decorate([
    (0, auth_decorator_1.Auth)('accounting.manage'),
    (0, audit_action_1.AuditAction)('budget.saved', 'Budget'),
    (0, common_1.Put)('budgets'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(budgetSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], LedgerController.prototype, "saveBudget", null);
__decorate([
    (0, auth_decorator_1.Auth)('accounting.manage'),
    (0, audit_action_1.AuditAction)('budget.deleted', 'Budget'),
    (0, common_1.Delete)('budgets/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], LedgerController.prototype, "deleteBudget", null);
__decorate([
    (0, auth_decorator_1.Auth)('accounting.manage'),
    (0, common_1.Get)('bank'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('from')),
    __param(3, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], LedgerController.prototype, "bank", null);
__decorate([
    (0, auth_decorator_1.Auth)('accounting.manage'),
    (0, audit_action_1.AuditAction)('bank.statement_imported', 'BankTransaction'),
    (0, common_1.Post)('bank/import'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(importSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], LedgerController.prototype, "importBank", null);
__decorate([
    (0, auth_decorator_1.Auth)('accounting.manage'),
    (0, common_1.Post)('bank/auto-match'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LedgerController.prototype, "autoMatch", null);
__decorate([
    (0, auth_decorator_1.Auth)('accounting.manage'),
    (0, common_1.Get)('bank/:id/candidates'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], LedgerController.prototype, "candidates", null);
__decorate([
    (0, auth_decorator_1.Auth)('accounting.manage'),
    (0, audit_action_1.AuditAction)('bank.matched', 'BankTransaction'),
    (0, common_1.Post)('bank/:id/match'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(matchSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], LedgerController.prototype, "match", null);
__decorate([
    (0, auth_decorator_1.Auth)('accounting.manage'),
    (0, audit_action_1.AuditAction)('bank.status_changed', 'BankTransaction'),
    (0, common_1.Patch)('bank/:id'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(statusSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], LedgerController.prototype, "setStatus", null);
__decorate([
    (0, auth_decorator_1.Auth)('accounting.manage'),
    (0, common_1.Get)('balance-sheet'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('asOf')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], LedgerController.prototype, "balanceSheet", null);
exports.LedgerController = LedgerController = __decorate([
    (0, swagger_1.ApiTags)('accounting'),
    (0, common_1.Controller)('v1/accounting'),
    __metadata("design:paramtypes", [ledger_service_1.LedgerService,
        branch_access_service_1.BranchAccessService])
], LedgerController);
//# sourceMappingURL=ledger.controller.js.map