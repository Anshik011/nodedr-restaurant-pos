import type { CreateStaffApiKeyDto, SessionUser } from '@nodedr-restaurant/types';
import { PrismaService } from '../prisma/prisma.service';
export declare class StaffApiKeysService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private generateToken;
    create(actor: SessionUser, dto: CreateStaffApiKeyDto): Promise<{
        id: string;
        name: string;
        token: string;
        lastFour: string;
        createdAt: Date;
    }>;
    list(actor: SessionUser): Promise<{
        id: string;
        name: string;
        lastFour: string;
        createdAt: Date;
        lastUsedAt: Date | null;
        revokedAt: Date | null;
    }[]>;
    revoke(actor: SessionUser, id: string): Promise<{
        ok: boolean;
    }>;
}
