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
exports.TransfersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const zod_1 = require("zod");
const audit_action_1 = require("../../audit/audit-action");
const auth_decorator_1 = require("../../common/decorators/auth.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const branch_access_service_1 = require("../../common/services/branch-access.service");
const transfers_service_1 = require("./transfers.service");
const transferSchema = zod_1.z.object({
    toBranchId: zod_1.z.string().min(1),
    ingredientId: zod_1.z.string().min(1),
    quantity: zod_1.z.coerce.number().positive().max(1_000_000),
    note: zod_1.z.string().trim().max(200).optional(),
});
let TransfersController = class TransfersController {
    transfers;
    branchAccess;
    constructor(transfers, branchAccess) {
        this.transfers = transfers;
        this.branchAccess = branchAccess;
    }
    async list(u, branchId) {
        await this.branchAccess.assertAccess(u.restaurantId, branchId);
        const [history, branches] = await Promise.all([
            this.transfers.list(u.restaurantId, branchId),
            this.transfers.otherBranches(u.restaurantId, branchId),
        ]);
        return { history, branches };
    }
    async create(u, branchId, body) {
        await this.branchAccess.assertAccess(u.restaurantId, branchId);
        return this.transfers.transfer(u.restaurantId, u.id, branchId, body);
    }
};
exports.TransfersController = TransfersController;
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TransfersController.prototype, "list", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, audit_action_1.AuditAction)('stock.transferred', 'StockTransfer'),
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(transferSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TransfersController.prototype, "create", null);
exports.TransfersController = TransfersController = __decorate([
    (0, swagger_1.ApiTags)('inventory'),
    (0, common_1.Controller)('v1/inventory/transfers'),
    __metadata("design:paramtypes", [transfers_service_1.TransfersService,
        branch_access_service_1.BranchAccessService])
], TransfersController);
//# sourceMappingURL=transfers.controller.js.map