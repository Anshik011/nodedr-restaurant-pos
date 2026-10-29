import type { CreateIntegrationApiKeyDto, SessionUser } from '@nodedr-restaurant/types';
import { PrismaService } from '../prisma/prisma.service';
import { BranchAccessService } from '../common/services/branch-access.service';
export declare class IntegrationApiKeysService {
    private readonly prisma;
    private readonly branchAccess;
    constructor(prisma: PrismaService, branchAccess: BranchAccessService);
    private generateToken;
    create(actor: SessionUser, dto: CreateIntegrationApiKeyDto): Promise<{
        id: string;
        name: string;
        token: string;
        lastFour: string;
        branchId: string | null;
        scopes: string[];
        createdAt: Date;
    }>;
    list(actor: SessionUser): Promise<{
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
    revoke(actor: SessionUser, id: string): Promise<{
        ok: boolean;
    }>;
}
