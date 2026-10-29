import { type SessionUser } from '@nodedr-restaurant/types';
import { StaffApiKeysService } from './staff-api-keys.service';
export declare class StaffApiKeysController {
    private readonly staffApiKeys;
    constructor(staffApiKeys: StaffApiKeysService);
    list(user: SessionUser): Promise<{
        id: string;
        name: string;
        lastFour: string;
        createdAt: Date;
        lastUsedAt: Date | null;
        revokedAt: Date | null;
    }[]>;
    create(user: SessionUser, body: unknown): Promise<{
        id: string;
        name: string;
        token: string;
        lastFour: string;
        createdAt: Date;
    }>;
    revoke(user: SessionUser, id: string): Promise<{
        ok: boolean;
    }>;
}
