import type { LeaveRequestDto, ShiftDto, StaffPayDto } from '@nodedr-restaurant/types';
import { BranchTimeService } from '../../common/services/branch-time.service';
import { PrismaService } from '../../prisma/prisma.service';
export declare class HrService {
    private readonly prisma;
    private readonly time;
    constructor(prisma: PrismaService, time: BranchTimeService);
    private assertStaffInBranch;
    listShifts(branchId: string, from?: string, to?: string, userId?: string): Promise<({
        user: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        userId: string;
        branchId: string;
        note: string | null;
        startsAt: Date;
        endsAt: Date;
    })[]>;
    createShift(branchId: string, dto: ShiftDto): Promise<{
        user: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        userId: string;
        branchId: string;
        note: string | null;
        startsAt: Date;
        endsAt: Date;
    }>;
    deleteShift(branchId: string, id: string): Promise<{
        ok: boolean;
    }>;
    requestLeave(userId: string, dto: LeaveRequestDto): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        branchId: string;
        status: import("@prisma/client").$Enums.LeaveStatus;
        type: import("@prisma/client").$Enums.LeaveType;
        startDate: Date;
        endDate: Date;
        reason: string | null;
        decidedById: string | null;
        decidedAt: Date | null;
    }>;
    myLeave(userId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        userId: string;
        branchId: string;
        status: import("@prisma/client").$Enums.LeaveStatus;
        type: import("@prisma/client").$Enums.LeaveType;
        startDate: Date;
        endDate: Date;
        reason: string | null;
        decidedById: string | null;
        decidedAt: Date | null;
    }[]>;
    listLeave(branchId: string, status?: string): import("@prisma/client").Prisma.PrismaPromise<({
        user: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        branchId: string;
        status: import("@prisma/client").$Enums.LeaveStatus;
        type: import("@prisma/client").$Enums.LeaveType;
        startDate: Date;
        endDate: Date;
        reason: string | null;
        decidedById: string | null;
        decidedAt: Date | null;
    })[]>;
    decideLeave(branchId: string, id: string, deciderId: string, status: 'APPROVED' | 'REJECTED'): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        branchId: string;
        status: import("@prisma/client").$Enums.LeaveStatus;
        type: import("@prisma/client").$Enums.LeaveType;
        startDate: Date;
        endDate: Date;
        reason: string | null;
        decidedById: string | null;
        decidedAt: Date | null;
    }>;
    listPay(branchId: string): Promise<{
        userId: string;
        name: string;
        payType: import("@prisma/client").$Enums.PayType | null;
        rate: number | null;
    }[]>;
    setPay(branchId: string, userId: string, dto: StaffPayDto): Promise<{
        userId: string;
        payType: import("@prisma/client").$Enums.PayType;
        rate: import("@prisma/client/runtime/library").Decimal;
    }>;
    listRuns(branchId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.PayrollStatus;
        periodStart: Date;
        periodEnd: Date;
        tipPool: import("@prisma/client/runtime/library").Decimal;
        totalNet: import("@prisma/client/runtime/library").Decimal;
        finalizedAt: Date | null;
    }[]>;
    getRun(branchId: string, id: string): Promise<{
        lines: ({
            user: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            userId: string;
            hoursWorked: import("@prisma/client/runtime/library").Decimal;
            basePay: import("@prisma/client/runtime/library").Decimal;
            tipShare: import("@prisma/client/runtime/library").Decimal;
            unpaidLeaveDeduction: import("@prisma/client/runtime/library").Decimal;
            netPay: import("@prisma/client/runtime/library").Decimal;
            runId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.PayrollStatus;
        periodStart: Date;
        periodEnd: Date;
        tipPool: import("@prisma/client/runtime/library").Decimal;
        totalNet: import("@prisma/client/runtime/library").Decimal;
        finalizedAt: Date | null;
    }>;
    createRun(branchId: string, periodStart: string, periodEnd: string): Promise<{
        lines: ({
            user: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            userId: string;
            hoursWorked: import("@prisma/client/runtime/library").Decimal;
            basePay: import("@prisma/client/runtime/library").Decimal;
            tipShare: import("@prisma/client/runtime/library").Decimal;
            unpaidLeaveDeduction: import("@prisma/client/runtime/library").Decimal;
            netPay: import("@prisma/client/runtime/library").Decimal;
            runId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.PayrollStatus;
        periodStart: Date;
        periodEnd: Date;
        tipPool: import("@prisma/client/runtime/library").Decimal;
        totalNet: import("@prisma/client/runtime/library").Decimal;
        finalizedAt: Date | null;
    }>;
    finalizeRun(branchId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.PayrollStatus;
        periodStart: Date;
        periodEnd: Date;
        tipPool: import("@prisma/client/runtime/library").Decimal;
        totalNet: import("@prisma/client/runtime/library").Decimal;
        finalizedAt: Date | null;
    }>;
    deleteRun(branchId: string, id: string): Promise<{
        ok: boolean;
    }>;
    performance(branchId: string, from: string, to: string): Promise<{
        userId: string;
        name: string;
        orders: number;
        sales: number;
        tips: number;
        hoursWorked: number;
        salesPerHour: number | null;
    }[]>;
}
