import { type SessionUser } from '@nodedr-restaurant/types';
import { IntegrationApiKeysService } from './integration-api-keys.service';
export declare class IntegrationApiKeysController {
    private readonly integrationApiKeys;
    constructor(integrationApiKeys: IntegrationApiKeysService);
    list(user: SessionUser): Promise<{
        id: string;
        name: string;
        lastFour: string;
        branch: {
            id: string;
            name: string;
        } | null;
        scopes: string[];
        createdAt: Date;
        lastUsedAt: Date | null;
        revokedAt: Date | null;
    }[]>;
    create(user: SessionUser, body: unknown): Promise<{
        id: string;
        name: string;
        token: string;
        lastFour: string;
        branchId: string | null;
        scopes: string[];
        createdAt: Date;
    }>;
    revoke(user: SessionUser, id: string): Promise<{
        ok: boolean;
    }>;
}
