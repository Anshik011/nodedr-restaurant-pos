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
exports.ReportSchedulesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const zod_1 = require("zod");
const audit_action_1 = require("../../audit/audit-action");
const auth_decorator_1 = require("../../common/decorators/auth.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const branch_access_service_1 = require("../../common/services/branch-access.service");
const email_service_1 = require("../email/email.service");
const reports_service_1 = require("./reports.service");
const report_schedules_service_1 = require("./report-schedules.service");
const createSchema = zod_1.z.object({
    reportKey: zod_1.z.string().min(1).max(60),
    frequency: zod_1.z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
    format: zod_1.z.enum(['csv', 'xlsx', 'pdf']),
    recipients: zod_1.z.array(zod_1.z.string().email()).min(1).max(10),
});
const activeSchema = zod_1.z.object({ isActive: zod_1.z.boolean() });
let ReportSchedulesController = class ReportSchedulesController {
    schedules;
    email;
    branchAccess;
    constructor(schedules, email, branchAccess) {
        this.schedules = schedules;
        this.email = email;
        this.branchAccess = branchAccess;
    }
    async list(u, branchId) {
        await this.branchAccess.assertAccess(u.restaurantId, branchId);
        return {
            emailConfigured: this.email.isConfigured(),
            schedules: await this.schedules.list(branchId),
        };
    }
    async create(u, branchId, body) {
        (0, reports_service_1.assertCanViewReport)(u.permissions, body.reportKey);
        await this.branchAccess.assertAccess(u.restaurantId, branchId);
        return this.schedules.create(branchId, body);
    }
    async toggle(u, branchId, id, body) {
        await this.branchAccess.assertAccess(u.restaurantId, branchId);
        return this.schedules.setActive(branchId, id, body.isActive);
    }
    async sendNow(u, branchId, id) {
        await this.branchAccess.assertAccess(u.restaurantId, branchId);
        return this.schedules.sendNow(branchId, id);
    }
    async remove(u, branchId, id) {
        await this.branchAccess.assertAccess(u.restaurantId, branchId);
        return this.schedules.remove(branchId, id);
    }
};
exports.ReportSchedulesController = ReportSchedulesController;
__decorate([
    (0, auth_decorator_1.Auth)('reports.access', 'data.export'),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ReportSchedulesController.prototype, "list", null);
__decorate([
    (0, auth_decorator_1.Auth)('reports.access', 'data.export'),
    (0, audit_action_1.AuditAction)('report_schedule.created', 'ReportSchedule'),
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(createSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ReportSchedulesController.prototype, "create", null);
__decorate([
    (0, auth_decorator_1.Auth)('reports.access', 'data.export'),
    (0, common_1.Patch)(':id'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(activeSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], ReportSchedulesController.prototype, "toggle", null);
__decorate([
    (0, auth_decorator_1.Auth)('reports.access', 'data.export'),
    (0, common_1.Post)(':id/send'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ReportSchedulesController.prototype, "sendNow", null);
__decorate([
    (0, auth_decorator_1.Auth)('reports.access', 'data.export'),
    (0, audit_action_1.AuditAction)('report_schedule.deleted', 'ReportSchedule'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ReportSchedulesController.prototype, "remove", null);
exports.ReportSchedulesController = ReportSchedulesController = __decorate([
    (0, swagger_1.ApiTags)('reports'),
    (0, common_1.Controller)('v1/report-schedules'),
    __metadata("design:paramtypes", [report_schedules_service_1.ReportSchedulesService,
        email_service_1.EmailService,
        branch_access_service_1.BranchAccessService])
], ReportSchedulesController);
//# sourceMappingURL=report-schedules.controller.js.map