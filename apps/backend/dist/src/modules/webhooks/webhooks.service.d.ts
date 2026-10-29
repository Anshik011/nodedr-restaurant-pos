import { ConfigService } from '@nestjs/config';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export declare const WEBHOOK_EVENTS: readonly ["order.created", "order.paid", "order.cancelled", "reservation.created", "delivery.updated", "campaign.message"];
export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];
export declare class WebhooksService {
    private readonly prisma;
    private readonly config;
    private readonly logger;
    constructor(prisma: PrismaService, config: ConfigService);
    private get keyMaterial();
    emitForBranch(branchId: string, event: WebhookEvent, data: unknown): Promise<void>;
    hasSubscriber(branchId: string, event: WebhookEvent): Promise<boolean>;
    emit(restaurantId: string, event: WebhookEvent, data: object): Promise<void>;
    list(restaurantId: string): Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        description: string | null;
        url: string;
        events: string[];
    }[]>;
    create(restaurantId: string, dto: {
        url: string;
        events: string[];
        description?: string;
    }): Promise<{
        secret: string;
        id: string;
        isActive: boolean;
        description: string | null;
        url: string;
        events: string[];
    }>;
    private validateEvents;
    private assertUrl;
    private get;
    setActive(restaurantId: string, id: string, isActive: boolean): Promise<{
        ok: boolean;
    }>;
    remove(restaurantId: string, id: string): Promise<{
        ok: boolean;
    }>;
    deliveries(restaurantId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.WebhookStatus;
        deliveredAt: Date | null;
        event: string;
        attempts: number;
        lastStatusCode: number | null;
        lastError: string | null;
    }[]>;
    sendTest(restaurantId: string, id: string): Promise<{
        status: import("@prisma/client").$Enums.WebhookStatus;
        attempts: number;
        lastStatusCode: number | null;
        lastError: string | null;
    }>;
    tick(): Promise<void>;
    cleanup(): Promise<void>;
    attempt(deliveryId: string): Promise<void>;
    private post;
}
