import type { Response } from 'express';
import { type SessionUser } from '@nodedr-restaurant/types';
import { BackupService } from './backup.service';
export declare class BackupController {
    private readonly backupService;
    constructor(backupService: BackupService);
    status(): Promise<{
        configured: boolean;
        source: "environment" | "database" | null;
        endpoint: string | null;
        bucket: string | null;
        region: string | null;
        accessKeyIdMasked: string | null;
        intervalDays: number;
        retainCount: number;
        lastBackup: {
            id: string;
            createdAt: Date;
            status: import("@prisma/client").$Enums.BackupStatus;
            sha256: string | null;
            sizeBytes: number | null;
            s3KeyDb: string | null;
            s3KeyUploads: string | null;
            triggeredById: string | null;
            failureReason: string | null;
            verifiedAt: Date | null;
        } | null;
        nextScheduledAt: Date | null;
    }>;
    list(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.BackupStatus;
        sha256: string | null;
        sizeBytes: number | null;
        s3KeyDb: string | null;
        s3KeyUploads: string | null;
        triggeredById: string | null;
        failureReason: string | null;
        verifiedAt: Date | null;
    }[]>;
    setConfig(user: SessionUser, body: unknown): Promise<{
        configured: boolean;
        source: "environment" | "database" | null;
        endpoint: string | null;
        bucket: string | null;
        region: string | null;
        accessKeyIdMasked: string | null;
        intervalDays: number;
        retainCount: number;
        lastBackup: {
            id: string;
            createdAt: Date;
            status: import("@prisma/client").$Enums.BackupStatus;
            sha256: string | null;
            sizeBytes: number | null;
            s3KeyDb: string | null;
            s3KeyUploads: string | null;
            triggeredById: string | null;
            failureReason: string | null;
            verifiedAt: Date | null;
        } | null;
        nextScheduledAt: Date | null;
    }>;
    clearConfig(user: SessionUser): Promise<{
        configured: boolean;
        source: "environment" | "database" | null;
        endpoint: string | null;
        bucket: string | null;
        region: string | null;
        accessKeyIdMasked: string | null;
        intervalDays: number;
        retainCount: number;
        lastBackup: {
            id: string;
            createdAt: Date;
            status: import("@prisma/client").$Enums.BackupStatus;
            sha256: string | null;
            sizeBytes: number | null;
            s3KeyDb: string | null;
            s3KeyUploads: string | null;
            triggeredById: string | null;
            failureReason: string | null;
            verifiedAt: Date | null;
        } | null;
        nextScheduledAt: Date | null;
    }>;
    trigger(user: SessionUser): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.BackupStatus;
        sha256: string | null;
        sizeBytes: number | null;
        s3KeyDb: string | null;
        s3KeyUploads: string | null;
        triggeredById: string | null;
        failureReason: string | null;
        verifiedAt: Date | null;
    }>;
    restore(user: SessionUser, id: string, body: unknown): Promise<{
        ok: boolean;
        restoredFrom: string;
    }>;
    exportLocal(user: SessionUser, res: Response): Promise<void>;
    download(user: SessionUser, id: string, res: Response): Promise<void>;
}
