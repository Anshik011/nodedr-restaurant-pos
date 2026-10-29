import { type SessionUser } from '@nodedr-restaurant/types';
import { BranchAccessService } from '../../common/services/branch-access.service';
import { ReservationsService } from './reservations.service';
export declare class ReservationsController {
    private readonly reservationsService;
    private readonly branchAccess;
    constructor(reservationsService: ReservationsService, branchAccess: BranchAccessService);
    list(user: SessionUser, branchId: string, date?: string): Promise<({
        table: {
            number: string;
            id: string;
            name: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        email: string | null;
        branchId: string;
        status: import("@prisma/client").$Enums.ReservationStatus;
        channel: import("@prisma/client").$Enums.OrderChannel;
        tableId: string | null;
        guestCount: number;
        deposit: import("@prisma/client/runtime/library").Decimal | null;
        customerName: string;
        reservedAt: Date;
        durationMinutes: number;
        specialRequests: string | null;
        reminderSentAt: Date | null;
    })[]>;
    create(user: SessionUser, branchId: string, body: unknown): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        email: string | null;
        branchId: string;
        status: import("@prisma/client").$Enums.ReservationStatus;
        channel: import("@prisma/client").$Enums.OrderChannel;
        tableId: string | null;
        guestCount: number;
        deposit: import("@prisma/client/runtime/library").Decimal | null;
        customerName: string;
        reservedAt: Date;
        durationMinutes: number;
        specialRequests: string | null;
        reminderSentAt: Date | null;
    }>;
    updateStatus(user: SessionUser, branchId: string, id: string, body: unknown): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        email: string | null;
        branchId: string;
        status: import("@prisma/client").$Enums.ReservationStatus;
        channel: import("@prisma/client").$Enums.OrderChannel;
        tableId: string | null;
        guestCount: number;
        deposit: import("@prisma/client/runtime/library").Decimal | null;
        customerName: string;
        reservedAt: Date;
        durationMinutes: number;
        specialRequests: string | null;
        reminderSentAt: Date | null;
    }>;
}
