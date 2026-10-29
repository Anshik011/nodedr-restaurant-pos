import type { Readable } from 'node:stream';
import { S3Client } from '@aws-sdk/client-s3';
import type { RestoreBackupDto, SessionUser, SetBackupConfigDto } from '@nodedr-restaurant/types';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
interface EffectiveConfig {
    endpoint: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    intervalDays: number;
    retainCount: number;
    source: 'database' | 'environment';
}
export declare class BackupService {
    private readonly prisma;
    private readonly audit;
    private readonly notifications;
    private readonly logger;
    constructor(prisma: PrismaService, audit: AuditService, notifications: NotificationsService);
    private getConfig;
    private requireConfig;
    private s3Client;
    private requireOwner;
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
    setConfig(user: SessionUser, dto: SetBackupConfigDto): Promise<{
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
    triggerManual(user: SessionUser): Promise<{
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
    checkSchedule(): Promise<void>;
    private runBackup;
    private enforceRetention;
    prepareDownload(user: SessionUser, id: string): Promise<{
        record: {
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
        };
        config: EffectiveConfig;
        s3: S3Client;
    }>;
    prepareLocalExport(user: SessionUser): Promise<{
        workDir: string;
        dbDumpPath: string;
        uploadsArchivePath: string | null;
    }>;
    fetchObjectStream(s3: S3Client, bucket: string, key: string): Promise<Readable>;
    restore(user: SessionUser, id: string, dto: RestoreBackupDto): Promise<{
        ok: boolean;
        restoredFrom: string;
    }>;
    private notifyOwners;
    private downloadBuffer;
    private downloadTo;
}
export {};
