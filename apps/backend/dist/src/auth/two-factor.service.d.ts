import { ConfigService } from '@nestjs/config';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
interface TwoFactorUser {
    id: string;
    twoFactorEnabled: boolean;
    twoFactorSecret: string | null;
    twoFactorRecoveryHashes: string[];
    twoFactorLastStep: number | null;
}
export declare class TwoFactorService {
    private readonly prisma;
    private readonly config;
    private readonly audit;
    private readonly failures;
    constructor(prisma: PrismaService, config: ConfigService, audit: AuditService);
    private get keyMaterial();
    private assertNotLocked;
    private fail;
    verifyLogin(user: TwoFactorUser, code: string | undefined): Promise<void>;
    private consumeRecoveryCode;
    status(userId: string): Promise<{
        enabled: boolean;
        recoveryCodesLeft: number;
    }>;
    setup(userId: string): Promise<{
        secret: string;
        otpauthUrl: string;
    }>;
    enable(userId: string, code: string): Promise<{
        recoveryCodes: string[];
    }>;
    disable(userId: string, password: string, code: string): Promise<{
        ok: boolean;
    }>;
    adminReset(actorId: string, restaurantId: string, targetUserId: string): Promise<{
        ok: boolean;
    }>;
    private clear;
}
export {};
