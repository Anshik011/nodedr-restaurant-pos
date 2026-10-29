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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_decorator_1 = require("../../common/decorators/auth.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const branch_access_service_1 = require("../../common/services/branch-access.service");
const csv_1 = require("./csv");
const export_1 = require("./export");
const reports_service_1 = require("./reports.service");
let ReportsController = class ReportsController {
    reports;
    branchAccess;
    constructor(reports, branchAccess) {
        this.reports = reports;
        this.branchAccess = branchAccess;
    }
    catalog(u) {
        return this.reports.catalog(u.permissions);
    }
    async run(u, key, branchId, from, to) {
        (0, reports_service_1.assertCanViewReport)(u.permissions, key);
        await this.branchAccess.assertAccess(u.restaurantId, branchId);
        return this.reports.run(key, branchId, from, to);
    }
    async csv(u, key, branchId, from, to) {
        (0, reports_service_1.assertCanViewReport)(u.permissions, key);
        await this.branchAccess.assertAccess(u.restaurantId, branchId);
        const r = await this.reports.run(key, branchId, from, to);
        return (0, csv_1.toCsv)(r.columns, r.rows);
    }
    async export(u, key, branchId, from, to, format = 'xlsx', res) {
        if (!(0, export_1.isExportFormat)(format))
            throw new common_1.BadRequestException('format must be csv, xlsx or pdf');
        (0, reports_service_1.assertCanViewReport)(u.permissions, key);
        await this.branchAccess.assertAccess(u.restaurantId, branchId);
        const r = await this.reports.run(key, branchId, from, to);
        const body = await (0, export_1.renderReport)(r, format, `${from} to ${to}`);
        const t = export_1.EXPORT_TYPES[format];
        res.setHeader('Content-Type', t.mime);
        res.setHeader('Content-Disposition', `attachment; filename="${key}_${from}_${to}.${t.ext}"`);
        res.send(body);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, auth_decorator_1.Auth)('reports.access'),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "catalog", null);
__decorate([
    (0, auth_decorator_1.Auth)('reports.access'),
    (0, common_1.Get)(':key'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('key')),
    __param(2, (0, common_1.Query)('branchId')),
    __param(3, (0, common_1.Query)('from')),
    __param(4, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "run", null);
__decorate([
    (0, auth_decorator_1.Auth)('reports.access', 'data.export'),
    (0, common_1.Get)(':key/csv'),
    (0, common_1.Header)('Content-Type', 'text/csv; charset=utf-8'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('key')),
    __param(2, (0, common_1.Query)('branchId')),
    __param(3, (0, common_1.Query)('from')),
    __param(4, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "csv", null);
__decorate([
    (0, auth_decorator_1.Auth)('reports.access', 'data.export'),
    (0, common_1.Get)(':key/export'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('key')),
    __param(2, (0, common_1.Query)('branchId')),
    __param(3, (0, common_1.Query)('from')),
    __param(4, (0, common_1.Query)('to')),
    __param(5, (0, common_1.Query)('format')),
    __param(6, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "export", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)('reports'),
    (0, common_1.Controller)('v1/reports'),
    __metadata("design:paramtypes", [reports_service_1.ReportsService,
        branch_access_service_1.BranchAccessService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map