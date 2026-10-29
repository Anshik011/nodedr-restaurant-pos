import type { SessionUser } from '@nodedr-restaurant/types';
import { BranchAccessService } from '../../common/services/branch-access.service';
import { AttendanceService } from './attendance.service';
export declare class AttendanceController {
    private readonly attendance;
    private readonly branchAccess;
    constructor(attendance: AttendanceService, branchAccess: BranchAccessService);
    me(user: SessionUser): Promise<({
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
    }) | null>;
    clockIn(user: SessionUser, body: {
        branchId: string;
        note?: string;
    }): Promise<{
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
    clockOut(user: SessionUser, body: {
        note?: string;
    }): Promise<{
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
    list(user: SessionUser, branchId: string, date?: string, userId?: string): Promise<({
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
