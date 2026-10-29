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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const time_1 = require("../../common/time");
const branch_time_service_1 = require("../../common/services/branch-time.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const WITH_USER = {
    user: { select: { id: true, name: true } },
};
let AttendanceService = class AttendanceService {
    prisma;
    time;
    constructor(prisma, time) {
        this.prisma = prisma;
        this.time = time;
    }
    current(userId) {
        return this.prisma.attendance.findFirst({
            where: { userId, clockOutAt: null },
            include: WITH_USER,
            orderBy: { clockInAt: 'desc' },
        });
    }
    async clockIn(userId, branchId, note) {
        if (await this.current(userId))
            throw new common_1.BadRequestException('Already clocked in');
        return this.prisma.attendance.create({
            data: { userId, branchId, note },
            include: WITH_USER,
        });
    }
    async clockOut(userId, note) {
        const open = await this.current(userId);
        if (!open)
            throw new common_1.BadRequestException('Not clocked in');
        return this.prisma.attendance.update({
            where: { id: open.id },
            data: { clockOutAt: new Date(), ...(note ? { note } : {}) },
            include: WITH_USER,
        });
    }
    async list(branchId, date, userId) {
        let range;
        if (date) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)))
                throw new common_1.BadRequestException('date must be YYYY-MM-DD');
            range = (0, time_1.zonedRange)(date, date, await this.time.tzForBranch(branchId));
        }
        return this.prisma.attendance.findMany({
            where: {
                branchId,
                ...(userId ? { userId } : {}),
                ...(range ? { clockInAt: range } : {}),
            },
            include: WITH_USER,
            orderBy: { clockInAt: 'desc' },
            take: 500,
        });
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        branch_time_service_1.BranchTimeService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map