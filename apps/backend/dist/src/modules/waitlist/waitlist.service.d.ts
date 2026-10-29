import type { CreateWaitlistEntryDto } from '@nodedr-restaurant/types';
import { PrismaService } from '../../prisma/prisma.service';
import { RealtimeGateway } from '../../realtime/realtime.gateway';
export declare class WaitlistService {
    private readonly prisma;
    private readonly realtime;
    constructor(prisma: PrismaService, realtime: RealtimeGateway);
    listWaiting(branchId: string): import("@prisma/client").Prisma.PrismaPromise<{
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
    create(branchId: string, dto: CreateWaitlistEntryDto): Promise<{
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
    seat(branchId: string, id: string, tableId: string): Promise<{
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
    cancel(branchId: string, id: string): Promise<{
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
