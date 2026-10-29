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
exports.HrService = void 0;
const common_1 = require("@nestjs/common");
const time_1 = require("../../common/time");
const branch_time_service_1 = require("../../common/services/branch-time.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const payroll_calc_1 = require("./payroll.calc");
const dayStart = (d) => new Date(`${d}T00:00:00.000Z`);
const USER = { select: { id: true, name: true } };
let HrService = class HrService {
    prisma;
    time;
    constructor(prisma, time) {
        this.prisma = prisma;
        this.time = time;
    }
    async assertStaffInBranch(branchId, userId) {
        const link = await this.prisma.userBranch.findFirst({
            where: { branchId, userId, user: { isActive: true } },
        });
        if (!link)
            throw new common_1.BadRequestException('That staff member is not in this branch');
    }
    async listShifts(branchId, from, to, userId) {
        const tz = await this.time.tzForBranch(branchId);
        const r = (0, time_1.zonedRange)(from ?? to ?? '1970-01-01', to ?? '9999-12-30', tz);
        return this.prisma.shift.findMany({
            where: {
                branchId,
                ...(userId ? { userId } : {}),
                ...(from || to
                    ? {
                        startsAt: {
                            ...(from ? { gte: r.gte } : {}),
                            ...(to ? { lt: r.lt } : {}),
                        },
                    }
                    : {}),
            },
            include: { user: USER },
            orderBy: { startsAt: 'asc' },
            take: 500,
        });
    }
    async createShift(branchId, dto) {
        await this.assertStaffInBranch(branchId, dto.userId);
        const startsAt = new Date(dto.startsAt);
        const endsAt = new Date(dto.endsAt);
        const clash = await this.prisma.shift.findFirst({
            where: {
                userId: dto.userId,
                startsAt: { lt: endsAt },
                endsAt: { gt: startsAt },
            },
        });
        if (clash)
            throw new common_1.BadRequestException('That person already has a shift at this time');
        const tz = await this.time.tzForBranch(branchId);
        const onLeave = await this.prisma.leaveRequest.findFirst({
            where: {
                userId: dto.userId,
                status: 'APPROVED',
                startDate: { lte: dayStart((0, time_1.localDate)(endsAt, tz)) },
                endDate: { gte: dayStart((0, time_1.localDate)(startsAt, tz)) },
            },
        });
        if (onLeave)
            throw new common_1.BadRequestException('That person has approved leave on this day');
        return this.prisma.shift.create({
            data: { branchId, userId: dto.userId, startsAt, endsAt, note: dto.note },
            include: { user: USER },
        });
    }
    async deleteShift(branchId, id) {
        const shift = await this.prisma.shift.findFirst({
            where: { id, branchId },
        });
        if (!shift)
            throw new common_1.NotFoundException('Shift not found');
        await this.prisma.shift.delete({ where: { id } });
        return { ok: true };
    }
    async requestLeave(userId, dto) {
        await this.assertStaffInBranch(dto.branchId, userId);
        return this.prisma.leaveRequest.create({
            data: {
                branchId: dto.branchId,
                userId,
                type: dto.type,
                startDate: dayStart(dto.startDate),
                endDate: dayStart(dto.endDate),
                reason: dto.reason,
            },
        });
    }
    myLeave(userId) {
        return this.prisma.leaveRequest.findMany({
            where: { userId },
            orderBy: { startDate: 'desc' },
            take: 100,
        });
    }
    listLeave(branchId, status) {
        return this.prisma.leaveRequest.findMany({
            where: {
                branchId,
                ...(status === 'PENDING' ||
                    status === 'APPROVED' ||
                    status === 'REJECTED'
                    ? { status }
                    : {}),
            },
            include: { user: USER },
            orderBy: { startDate: 'desc' },
            take: 200,
        });
    }
    async decideLeave(branchId, id, deciderId, status) {
        const leave = await this.prisma.leaveRequest.findFirst({
            where: { id, branchId },
        });
        if (!leave)
            throw new common_1.NotFoundException('Leave request not found');
        if (leave.status !== 'PENDING')
            throw new common_1.BadRequestException('Already decided');
        return this.prisma.leaveRequest.update({
            where: { id },
            data: { status, decidedById: deciderId, decidedAt: new Date() },
        });
    }
    async listPay(branchId) {
        const links = await this.prisma.userBranch.findMany({
            where: { branchId, user: { isActive: true } },
            include: { user: { select: { id: true, name: true, payProfile: true } } },
        });
        return links.map((l) => ({
            userId: l.user.id,
            name: l.user.name,
            payType: l.user.payProfile?.payType ?? null,
            rate: l.user.payProfile ? Number(l.user.payProfile.rate) : null,
        }));
    }
    async setPay(branchId, userId, dto) {
        await this.assertStaffInBranch(branchId, userId);
        return this.prisma.staffPay.upsert({
            where: { userId },
            create: { userId, payType: dto.payType, rate: dto.rate },
            update: { payType: dto.payType, rate: dto.rate },
        });
    }
    listRuns(branchId) {
        return this.prisma.payrollRun.findMany({
            where: { branchId },
            orderBy: { periodStart: 'desc' },
            take: 50,
        });
    }
    async getRun(branchId, id) {
        const run = await this.prisma.payrollRun.findFirst({
            where: { id, branchId },
            include: {
                lines: { include: { user: USER }, orderBy: { user: { name: 'asc' } } },
            },
        });
        if (!run)
            throw new common_1.NotFoundException('Payroll run not found');
        return run;
    }
    async createRun(branchId, periodStart, periodEnd) {
        const overlap = await this.prisma.payrollRun.findFirst({
            where: {
                branchId,
                periodStart: { lte: dayStart(periodEnd) },
                periodEnd: { gte: dayStart(periodStart) },
            },
        });
        if (overlap)
            throw new common_1.BadRequestException('A payroll run already covers part of this period');
        const from = dayStart(periodStart);
        const tz = await this.time.tzForBranch(branchId);
        const zoned = (0, time_1.zonedRange)(periodStart, periodEnd, tz);
        const links = await this.prisma.userBranch.findMany({
            where: {
                branchId,
                user: { isActive: true, payProfile: { isNot: null } },
            },
            include: { user: { select: { id: true, payProfile: true } } },
        });
        if (links.length === 0)
            throw new common_1.BadRequestException('Set a pay rate for at least one staff member first');
        const records = await this.prisma.attendance.findMany({
            where: {
                branchId,
                clockOutAt: { not: null, gt: zoned.gte },
                clockInAt: { lt: zoned.lt },
            },
        });
        const hours = new Map();
        for (const r of records) {
            const start = Math.max(r.clockInAt.getTime(), zoned.gte.getTime());
            const end = Math.min(r.clockOutAt.getTime(), zoned.lt.getTime());
            if (end > start)
                hours.set(r.userId, (hours.get(r.userId) ?? 0) + (end - start) / 3_600_000);
        }
        const leaves = await this.prisma.leaveRequest.findMany({
            where: {
                branchId,
                status: 'APPROVED',
                type: 'UNPAID',
                startDate: { lte: dayStart(periodEnd) },
                endDate: { gte: from },
            },
        });
        const unpaidDays = new Map();
        for (const l of leaves) {
            const s = Math.max(l.startDate.getTime(), from.getTime());
            const e = Math.min(l.endDate.getTime(), dayStart(periodEnd).getTime());
            if (e >= s)
                unpaidDays.set(l.userId, (unpaidDays.get(l.userId) ?? 0) +
                    Math.round((e - s) / 86_400_000) +
                    1);
        }
        const tips = await this.prisma.order.aggregate({
            where: { branchId, status: 'PAID', billedAt: zoned },
            _sum: { tipAmount: true },
        });
        const tipPool = (0, payroll_calc_1.round2)(Number(tips._sum.tipAmount ?? 0));
        const lines = (0, payroll_calc_1.computePayroll)(periodStart, periodEnd, tipPool, links.map((l) => ({
            userId: l.user.id,
            payType: l.user.payProfile.payType,
            rate: Number(l.user.payProfile.rate),
            hoursWorked: hours.get(l.user.id) ?? 0,
            unpaidLeaveDays: unpaidDays.get(l.user.id) ?? 0,
        })));
        return this.prisma.payrollRun.create({
            data: {
                branchId,
                periodStart: from,
                periodEnd: dayStart(periodEnd),
                tipPool,
                totalNet: (0, payroll_calc_1.round2)(lines.reduce((s, l) => s + l.netPay, 0)),
                lines: { create: lines },
            },
            include: { lines: { include: { user: USER } } },
        });
    }
    async finalizeRun(branchId, id) {
        const run = await this.getRun(branchId, id);
        if (run.status !== 'DRAFT')
            throw new common_1.BadRequestException('Already finalized');
        return this.prisma.payrollRun.update({
            where: { id },
            data: { status: 'FINALIZED', finalizedAt: new Date() },
        });
    }
    async deleteRun(branchId, id) {
        const run = await this.getRun(branchId, id);
        if (run.status !== 'DRAFT')
            throw new common_1.BadRequestException('A finalized payroll run cannot be deleted');
        await this.prisma.payrollRun.delete({ where: { id } });
        return { ok: true };
    }
    async performance(branchId, from, to) {
        const range = (0, time_1.zonedRange)(from, to, await this.time.tzForBranch(branchId));
        const f = range.gte;
        const t = range.lt;
        const [orders, attendance, links] = await Promise.all([
            this.prisma.order.groupBy({
                by: ['createdById'],
                where: { branchId, status: 'PAID', billedAt: range },
                _count: { _all: true },
                _sum: { totalAmount: true, tipAmount: true },
            }),
            this.prisma.attendance.findMany({
                where: {
                    branchId,
                    clockOutAt: { not: null, gt: f },
                    clockInAt: { lt: t },
                },
            }),
            this.prisma.userBranch.findMany({
                where: { branchId },
                include: { user: USER },
            }),
        ]);
        const hours = new Map();
        for (const r of attendance) {
            const s = Math.max(r.clockInAt.getTime(), f.getTime());
            const e = Math.min(r.clockOutAt.getTime(), t.getTime());
            if (e > s)
                hours.set(r.userId, (hours.get(r.userId) ?? 0) + (e - s) / 3_600_000);
        }
        const byUser = new Map(orders.map((o) => [o.createdById, o]));
        return links
            .map((l) => {
            const o = byUser.get(l.user.id);
            const h = hours.get(l.user.id) ?? 0;
            const sales = Number(o?._sum.totalAmount ?? 0);
            return {
                userId: l.user.id,
                name: l.user.name,
                orders: o?._count._all ?? 0,
                sales: (0, payroll_calc_1.round2)(sales),
                tips: (0, payroll_calc_1.round2)(Number(o?._sum.tipAmount ?? 0)),
                hoursWorked: (0, payroll_calc_1.round2)(h),
                salesPerHour: h > 0 ? (0, payroll_calc_1.round2)(sales / h) : null,
            };
        })
            .sort((a, b) => b.sales - a.sales);
    }
};
exports.HrService = HrService;
exports.HrService = HrService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        branch_time_service_1.BranchTimeService])
], HrService);
//# sourceMappingURL=hr.service.js.map