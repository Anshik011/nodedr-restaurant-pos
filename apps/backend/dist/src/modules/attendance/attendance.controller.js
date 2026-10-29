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
exports.AttendanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_decorator_1 = require("../../common/decorators/auth.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const branch_access_service_1 = require("../../common/services/branch-access.service");
const attendance_service_1 = require("./attendance.service");
let AttendanceController = class AttendanceController {
    attendance;
    branchAccess;
    constructor(attendance, branchAccess) {
        this.attendance = attendance;
        this.branchAccess = branchAccess;
    }
    async me(user) {
        return (await this.attendance.current(user.id)) ?? null;
    }
    async clockIn(user, body) {
        await this.branchAccess.assertAccess(user.restaurantId, body.branchId);
        return this.attendance.clockIn(user.id, body.branchId, body.note);
    }
    clockOut(user, body) {
        return this.attendance.clockOut(user.id, body?.note);
    }
    async list(user, branchId, date, userId) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.attendance.list(branchId, date, userId);
    }
};
exports.AttendanceController = AttendanceController;
__decorate([
    (0, auth_decorator_1.Auth)(),
    (0, common_1.Get)('me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "me", null);
__decorate([
    (0, auth_decorator_1.Auth)(),
    (0, common_1.Post)('clock-in'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "clockIn", null);
__decorate([
    (0, auth_decorator_1.Auth)(),
    (0, common_1.Post)('clock-out'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "clockOut", null);
__decorate([
    (0, auth_decorator_1.Auth)('attendance.manage'),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('date')),
    __param(3, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "list", null);
exports.AttendanceController = AttendanceController = __decorate([
    (0, swagger_1.ApiTags)('attendance'),
    (0, common_1.Controller)('v1/attendance'),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService,
        branch_access_service_1.BranchAccessService])
], AttendanceController);
//# sourceMappingURL=attendance.controller.js.map