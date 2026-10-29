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
exports.ReservationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const types_1 = require("@nodedr-restaurant/types");
const auth_decorator_1 = require("../../common/decorators/auth.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const branch_access_service_1 = require("../../common/services/branch-access.service");
const reservations_service_1 = require("./reservations.service");
let ReservationsController = class ReservationsController {
    reservationsService;
    branchAccess;
    constructor(reservationsService, branchAccess) {
        this.reservationsService = reservationsService;
        this.branchAccess = branchAccess;
    }
    async list(user, branchId, date) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.reservationsService.list(branchId, date);
    }
    async create(user, branchId, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.reservationsService.create(branchId, body);
    }
    async updateStatus(user, branchId, id, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        const { status } = body;
        return this.reservationsService.updateStatus(branchId, id, status);
    }
};
exports.ReservationsController = ReservationsController;
__decorate([
    (0, auth_decorator_1.Auth)('reservations.manage'),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "list", null);
__decorate([
    (0, auth_decorator_1.Auth)('reservations.manage'),
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.createReservationSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "create", null);
__decorate([
    (0, auth_decorator_1.Auth)('reservations.manage'),
    (0, common_1.Patch)(':id/status'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.updateReservationStatusSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "updateStatus", null);
exports.ReservationsController = ReservationsController = __decorate([
    (0, swagger_1.ApiTags)('reservations'),
    (0, common_1.Controller)('v1/reservations'),
    __metadata("design:paramtypes", [reservations_service_1.ReservationsService,
        branch_access_service_1.BranchAccessService])
], ReservationsController);
//# sourceMappingURL=reservations.controller.js.map