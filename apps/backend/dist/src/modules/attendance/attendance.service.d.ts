import { BranchTimeService } from '../../common/services/branch-time.service';
import { PrismaService } from '../../prisma/prisma.service';
export declare class AttendanceService {
    private readonly prisma;
    private readonly time;
    constructor(prisma: PrismaService, time: BranchTimeService);
    current(userId: string): import("@prisma/client").Prisma.Prisma__AttendanceClient<({
        user: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        userId: string;
        branchId: string;
        clockInAt: Date;
        clockOutAt: Date | null;
        note: string | null;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    clockIn(userId: string, branchId: string, note?: string): Promise<{
        user: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        userId: string;
        branchId: string;
        clockInAt: Date;
        clockOutAt: Date | null;
        note: string | null;
    }>;
    clockOut(userId: string, note?: string): Promise<{
        user: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        userId: string;
        branchId: string;
        clockInAt: Date;
        clockOutAt: Date | null;
        note: string | null;
    }>;
    list(branchId: string, date?: string, userId?: string): Promise<({
        user: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        userId: string;
        branchId: string;
        clockInAt: Date;
        clockOutAt: Date | null;
        note: string | null;
    })[]>;
}
