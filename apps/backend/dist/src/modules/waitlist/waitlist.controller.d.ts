import { type SessionUser } from '@nodedr-restaurant/types';
import { BranchAccessService } from '../../common/services/branch-access.service';
import { WaitlistService } from './waitlist.service';
export declare class WaitlistController {
    private readonly waitlistService;
    private readonly branchAccess;
    constructor(waitlistService: WaitlistService, branchAccess: BranchAccessService);
    list(user: SessionUser, branchId: string): Promise<{
        id: string;
        createdAt: Date;
        phone: string | null;
        branchId: string;
        status: import("@prisma/client").$Enums.WaitlistStatus;
        notes: string | null;
        tableId: string | null;
        customerName: string;
        partySize: number;
        quotedWaitMinutes: number | null;
        seatedAt: Date | null;
    }[]>;
    create(user: SessionUser, branchId: string, body: unknown): Promise<{
        id: string;
        createdAt: Date;
        phone: string | null;
        branchId: string;
        status: import("@prisma/client").$Enums.WaitlistStatus;
        notes: string | null;
        tableId: string | null;
        customerName: string;
        partySize: number;
        quotedWaitMinutes: number | null;
        seatedAt: Date | null;
    }>;
    seat(user: SessionUser, branchId: string, id: string, body: unknown): Promise<{
        id: string;
        createdAt: Date;
        phone: string | null;
        branchId: string;
        status: import("@prisma/client").$Enums.WaitlistStatus;
        notes: string | null;
        tableId: string | null;
        customerName: string;
        partySize: number;
        quotedWaitMinutes: number | null;
        seatedAt: Date | null;
    }>;
    cancel(user: SessionUser, branchId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        phone: string | null;
        branchId: string;
        status: import("@prisma/client").$Enums.WaitlistStatus;
        notes: string | null;
        tableId: string | null;
        customerName: string;
        partySize: number;
        quotedWaitMinutes: number | null;
        seatedAt: Date | null;
    }>;
}
