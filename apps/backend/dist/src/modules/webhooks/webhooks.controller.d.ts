import type { SessionUser } from '@nodedr-restaurant/types';
import { z } from 'zod';
import { WebhooksService } from './webhooks.service';
declare const createSchema: z.ZodObject<{
    url: z.ZodString;
    events: z.ZodArray<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare class WebhooksController {
    private readonly webhooks;
    constructor(webhooks: WebhooksService);
    events(): readonly ["order.created", "order.paid", "order.cancelled", "reservation.created", "delivery.updated", "campaign.message"];
    list(u: SessionUser): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        description: string | null;
        url: string;
        events: string[];
    }[]>;
    create(u: SessionUser, body: z.infer<typeof createSchema>): Promise<{
        secret: string;
        id: string;
        isActive: boolean;
        description: string | null;
        url: string;
        events: string[];
    }>;
    setActive(u: SessionUser, id: string, body: {
        isActive: boolean;
    }): Promise<{
        ok: boolean;
    }>;
    remove(u: SessionUser, id: string): Promise<{
        ok: boolean;
    }>;
    deliveries(u: SessionUser, id: string): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.WebhookStatus;
        deliveredAt: Date | null;
        event: string;
        attempts: number;
        lastStatusCode: number | null;
        lastError: string | null;
    }[]>;
    test(u: SessionUser, id: string): Promise<{
        status: import("@prisma/client").$Enums.WebhookStatus;
        attempts: number;
        lastStatusCode: number | null;
        lastError: string | null;
    }>;
}
export {};
