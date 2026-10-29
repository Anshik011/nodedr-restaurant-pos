import type { CreateReservationDto, ReservationStatusDto } from '@nodedr-restaurant/types';
import { NotificationsService } from '../../notifications/notifications.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RealtimeGateway } from '../../realtime/realtime.gateway';
import { WebhooksService } from '../webhooks/webhooks.service';
export interface CreateReservationOptions {
    fromWebsite?: boolean;
}
export declare class ReservationsService {
    private readonly prisma;
    private readonly realtime;
    private readonly notifications;
    private readonly webhooks;
    private readonly logger;
    constructor(prisma: PrismaService, realtime: RealtimeGateway, notifications: NotificationsService, webhooks: WebhooksService);
    list(branchId: string, date?: string): import("@prisma/client").Prisma.PrismaPromise<({
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
    create(branchId: string, dto: CreateReservationDto, options?: CreateReservationOptions): Promise<{
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
    private assertWithinOnlineBookingCapacity;
    updateStatus(branchId: string, id: string, status: ReservationStatusDto): Promise<{
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
