import { type SessionUser } from '@nodedr-restaurant/types';
import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    list(user: SessionUser, query: Record<string, string>): Promise<{
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
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        })[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    entities(user: SessionUser): Promise<string[]>;
}
