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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchTimeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let BranchTimeService = class BranchTimeService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async tzForBranch(branchId) {
        const branch = await this.prisma.branch.findUnique({
            where: { id: branchId },
            select: { restaurant: { select: { timezone: true } } },
        });
        return branch?.restaurant.timezone ?? 'Asia/Kolkata';
    }
    async tzForRestaurant(restaurantId) {
        const r = await this.prisma.restaurant.findUnique({
            where: { id: restaurantId },
            select: { timezone: true },
        });
        return r?.timezone ?? 'Asia/Kolkata';
    }
};
exports.BranchTimeService = BranchTimeService;
exports.BranchTimeService = BranchTimeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BranchTimeService);
//# sourceMappingURL=branch-time.service.js.map