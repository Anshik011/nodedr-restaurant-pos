import { type SessionUser } from '@nodedr-restaurant/types';
import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    list(user: SessionUser, query: Record<string, string>): Promise<{
        data: {
            id: string;
            createdAt: Date;
            branchId: string;
            type: string;
            entity: string | null;
            entityId: string | null;
            body: string;
            title: string;
            readAt: Date | null;
            recipientUserId: string | null;
        }[];
        total: number;
        unreadCount: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    markRead(user: SessionUser, id: string): Promise<{
        id: string;
        readAt: Date | null;
    }>;
    markAllRead(user: SessionUser): Promise<{
        ok: boolean;
    }>;
}
