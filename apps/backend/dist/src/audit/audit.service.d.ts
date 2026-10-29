import type { AuditLogListQueryDto } from '@nodedr-restaurant/types';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export interface RecordAuditLogInput {
    userId?: string | null;
    action: string;
    entity: string;
    entityId?: string | null;
    metadata?: Prisma.InputJsonValue | null;
}
export declare class AuditService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    record(input: RecordAuditLogInput): Promise<void>;
    list(restaurantId: string, query: AuditLogListQueryDto): Promise<{
        data: ({
            user: {
                id: string;
                name: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            userId: string | null;
            action: string;
            entity: string;
            entityId: string | null;
            metadata: Prisma.JsonValue | null;
        })[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    listEntities(restaurantId: string): Promise<string[]>;
}
