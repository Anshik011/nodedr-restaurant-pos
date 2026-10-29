"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BackupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupService = void 0;
const node_crypto_1 = require("node:crypto");
const node_child_process_1 = require("node:child_process");
const node_util_1 = require("node:util");
const fs = __importStar(require("node:fs/promises"));
const fsSync = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const os = __importStar(require("node:os"));
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const client_s3_1 = require("@aws-sdk/client-s3");
const audit_service_1 = require("../audit/audit.service");
const notifications_service_1 = require("../notifications/notifications.service");
const prisma_service_1 = require("../prisma/prisma.service");
const image_upload_config_1 = require("../common/upload/image-upload.config");
const execFileAsync = (0, node_util_1.promisify)(node_child_process_1.execFile);
const CONFIG_ID = 'singleton';
function mask(value) {
    return value.length <= 4 ? '****' : `****${value.slice(-4)}`;
}
let BackupService = BackupService_1 = class BackupService {
    prisma;
    audit;
    notifications;
    logger = new common_1.Logger(BackupService_1.name);
    constructor(prisma, audit, notifications) {
        this.prisma = prisma;
        this.audit = audit;
        this.notifications = notifications;
    }
    async getConfig() {
        const row = await this.prisma.backupConfig.findUnique({
            where: { id: CONFIG_ID },
        });
        if (row) {
            return {
                endpoint: row.endpoint,
                bucket: row.bucket,
                accessKeyId: row.accessKeyId,
                secretAccessKey: row.secretAccessKey,
                region: row.region,
                intervalDays: row.intervalDays,
                retainCount: row.retainCount,
                source: 'database',
            };
        }
        const { S3_BACKUP_ENDPOINT, S3_BACKUP_BUCKET, S3_BACKUP_ACCESS_KEY_ID, S3_BACKUP_SECRET_ACCESS_KEY, } = process.env;
        if (S3_BACKUP_ENDPOINT &&
            S3_BACKUP_BUCKET &&
            S3_BACKUP_ACCESS_KEY_ID &&
            S3_BACKUP_SECRET_ACCESS_KEY) {
            return {
                endpoint: S3_BACKUP_ENDPOINT,
                bucket: S3_BACKUP_BUCKET,
                accessKeyId: S3_BACKUP_ACCESS_KEY_ID,
                secretAccessKey: S3_BACKUP_SECRET_ACCESS_KEY,
                region: process.env.S3_BACKUP_REGION ?? 'auto',
                intervalDays: Number(process.env.S3_BACKUP_INTERVAL_DAYS ?? 3),
                retainCount: Number(process.env.S3_BACKUP_RETAIN_COUNT ?? 2),
                source: 'environment',
            };
        }
        return null;
    }
    async requireConfig() {
        const config = await this.getConfig();
        if (!config) {
            throw new common_1.BadRequestException('S3 backup is not configured. Add your S3 endpoint, bucket, and access key in Settings > Backup.');
        }
        return config;
    }
    s3Client(config) {
        return new client_s3_1.S3Client({
            endpoint: config.endpoint,
            region: config.region,
            forcePathStyle: true,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
        });
    }
    requireOwner(user) {
        if (user.roleName !== 'OWNER') {
            throw new common_1.ForbiddenException('Only the Owner can restore a backup');
        }
    }
    async status() {
        const [config, lastVerified, lastAny] = await Promise.all([
            this.getConfig(),
            this.prisma.backup.findFirst({
                where: { status: 'VERIFIED' },
                orderBy: { verifiedAt: 'desc' },
            }),
            this.prisma.backup.findFirst({ orderBy: { createdAt: 'desc' } }),
        ]);
        const nextScheduledAt = config && lastVerified?.verifiedAt
            ? new Date(lastVerified.verifiedAt.getTime() +
                config.intervalDays * 24 * 60 * 60 * 1000)
            : null;
        return {
            configured: config !== null,
            source: config?.source ?? null,
            endpoint: config?.endpoint ?? null,
            bucket: config?.bucket ?? null,
            region: config?.region ?? null,
            accessKeyIdMasked: config ? mask(config.accessKeyId) : null,
            intervalDays: config?.intervalDays ?? 3,
            retainCount: config?.retainCount ?? 2,
            lastBackup: lastAny,
            nextScheduledAt,
        };
    }
    list() {
        return this.prisma.backup.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }
    async setConfig(user, dto) {
        const candidate = {
            endpoint: dto.endpoint,
            bucket: dto.bucket,
            accessKeyId: dto.accessKeyId,
            secretAccessKey: dto.secretAccessKey,
            region: dto.region ?? 'auto',
            intervalDays: dto.intervalDays ?? 3,
            retainCount: dto.retainCount ?? 2,
            source: 'database',
        };
        const s3 = this.s3Client(candidate);
        const probeKey = `connectivity-check/${Date.now()}.txt`;
        try {
            await s3.send(new client_s3_1.PutObjectCommand({
                Bucket: candidate.bucket,
                Key: probeKey,
                Body: Buffer.from('ok'),
            }));
            await this.downloadBuffer(s3, candidate.bucket, probeKey);
            await s3.send(new client_s3_1.DeleteObjectCommand({ Bucket: candidate.bucket, Key: probeKey }));
        }
        catch (err) {
            throw new common_1.BadRequestException(`Could not connect to that bucket: ${err.message}`);
        }
        await this.prisma.backupConfig.upsert({
            where: { id: CONFIG_ID },
            create: {
                id: CONFIG_ID,
                endpoint: candidate.endpoint,
                bucket: candidate.bucket,
                accessKeyId: candidate.accessKeyId,
                secretAccessKey: candidate.secretAccessKey,
                region: candidate.region,
                intervalDays: candidate.intervalDays,
                retainCount: candidate.retainCount,
                updatedById: user.id,
            },
            update: {
                endpoint: candidate.endpoint,
                bucket: candidate.bucket,
                accessKeyId: candidate.accessKeyId,
                secretAccessKey: candidate.secretAccessKey,
                region: candidate.region,
                intervalDays: candidate.intervalDays,
                retainCount: candidate.retainCount,
                updatedById: user.id,
            },
        });
        await this.audit.record({
            userId: user.id,
            action: 'backup.config_updated',
            entity: 'BackupConfig',
            metadata: {
                endpoint: candidate.endpoint,
                bucket: candidate.bucket,
                region: candidate.region,
                intervalDays: candidate.intervalDays,
                retainCount: candidate.retainCount,
            },
        });
        return this.status();
    }
    async clearConfig(user) {
        await this.prisma.backupConfig.deleteMany({ where: { id: CONFIG_ID } });
        await this.audit.record({
            userId: user.id,
            action: 'backup.config_cleared',
            entity: 'BackupConfig',
        });
        return this.status();
    }
    async triggerManual(user) {
        const config = await this.requireConfig();
        return this.runBackup(config, user.id);
    }
    async checkSchedule() {
        const config = await this.getConfig();
        if (!config)
            return;
        const last = await this.prisma.backup.findFirst({
            where: { status: 'VERIFIED' },
            orderBy: { verifiedAt: 'desc' },
        });
        const due = !last?.verifiedAt ||
            Date.now() - last.verifiedAt.getTime() >=
                config.intervalDays * 24 * 60 * 60 * 1000;
        if (!due)
            return;
        this.logger.log(`Backup interval elapsed (${config.intervalDays}d) — starting scheduled backup`);
        try {
            await this.runBackup(config, null);
        }
        catch (err) {
            this.logger.error(`Scheduled backup failed: ${err.message}`);
        }
    }
    async runBackup(config, triggeredById) {
        const record = await this.prisma.backup.create({
            data: { triggeredById, status: 'PENDING' },
        });
        const workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'orderrestro-backup-'));
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const dbDumpPath = path.join(workDir, 'db.dump');
        const uploadsArchivePath = path.join(workDir, 'uploads.tar.gz');
        const uploadRoot = (0, image_upload_config_1.uploadsDir)();
        if (triggeredById) {
            await this.audit.record({
                userId: triggeredById,
                action: 'backup.triggered',
                entity: 'Backup',
                entityId: record.id,
            });
        }
        try {
            await execFileAsync('pg_dump', [
                '--format=custom',
                '--file',
                dbDumpPath,
                process.env.DATABASE_URL,
            ]);
            const uploadsExist = fsSync.existsSync(uploadRoot);
            if (uploadsExist) {
                await execFileAsync('tar', [
                    '-czf',
                    uploadsArchivePath,
                    '-C',
                    path.dirname(uploadRoot),
                    path.basename(uploadRoot),
                ]);
            }
            const s3 = this.s3Client(config);
            const dbKey = `${timestamp}/db.dump`;
            const dbBuffer = await fs.readFile(dbDumpPath);
            const sha256 = (0, node_crypto_1.createHash)('sha256').update(dbBuffer).digest('hex');
            await s3.send(new client_s3_1.PutObjectCommand({
                Bucket: config.bucket,
                Key: dbKey,
                Body: dbBuffer,
            }));
            let uploadsKey;
            let totalSize = dbBuffer.length;
            if (uploadsExist) {
                uploadsKey = `${timestamp}/uploads.tar.gz`;
                const uploadsBuffer = await fs.readFile(uploadsArchivePath);
                await s3.send(new client_s3_1.PutObjectCommand({
                    Bucket: config.bucket,
                    Key: uploadsKey,
                    Body: uploadsBuffer,
                }));
                totalSize += uploadsBuffer.length;
            }
            const downloadedDb = await this.downloadBuffer(s3, config.bucket, dbKey);
            if ((0, node_crypto_1.createHash)('sha256').update(downloadedDb).digest('hex') !== sha256) {
                throw new Error('Verification failed: downloaded db backup does not match the uploaded content');
            }
            if (uploadsKey) {
                const uploadsBuffer = await fs.readFile(uploadsArchivePath);
                const downloadedUploads = await this.downloadBuffer(s3, config.bucket, uploadsKey);
                if (downloadedUploads.length !== uploadsBuffer.length) {
                    throw new Error('Verification failed: downloaded uploads archive size does not match the local file');
                }
            }
            const completed = await this.prisma.backup.update({
                where: { id: record.id },
                data: {
                    status: 'VERIFIED',
                    s3KeyDb: dbKey,
                    s3KeyUploads: uploadsKey,
                    sizeBytes: totalSize,
                    sha256,
                    verifiedAt: new Date(),
                },
            });
            await this.enforceRetention(config);
            await this.notifyOwners({
                type: 'backup.completed',
                title: 'Backup completed',
                body: `A new backup finished and was verified (${(totalSize / (1024 * 1024)).toFixed(1)} MB).`,
                entity: 'Backup',
                entityId: record.id,
            });
            return completed;
        }
        catch (err) {
            const failureReason = err.message;
            await this.prisma.backup.update({
                where: { id: record.id },
                data: { status: 'FAILED', failureReason },
            });
            await this.notifyOwners({
                type: 'backup.failed',
                title: 'Backup failed',
                body: failureReason,
                entity: 'Backup',
                entityId: record.id,
            });
            throw err;
        }
        finally {
            await fs.rm(workDir, { recursive: true, force: true });
        }
    }
    async enforceRetention(config) {
        const verified = await this.prisma.backup.findMany({
            where: { status: 'VERIFIED' },
            orderBy: { verifiedAt: 'desc' },
        });
        const stale = verified.slice(config.retainCount);
        if (stale.length === 0)
            return;
        const s3 = this.s3Client(config);
        for (const old of stale) {
            try {
                if (old.s3KeyDb) {
                    await s3.send(new client_s3_1.DeleteObjectCommand({
                        Bucket: config.bucket,
                        Key: old.s3KeyDb,
                    }));
                }
                if (old.s3KeyUploads) {
                    await s3.send(new client_s3_1.DeleteObjectCommand({
                        Bucket: config.bucket,
                        Key: old.s3KeyUploads,
                    }));
                }
                await this.prisma.backup.delete({ where: { id: old.id } });
            }
            catch (err) {
                this.logger.error(`Failed to delete stale backup ${old.id}: ${err.message}`);
            }
        }
    }
    async prepareDownload(user, id) {
        const record = await this.prisma.backup.findFirst({ where: { id } });
        if (!record || record.status !== 'VERIFIED' || !record.s3KeyDb) {
            throw new common_1.BadRequestException('Backup not found or not in a downloadable (VERIFIED) state');
        }
        const config = await this.requireConfig();
        const s3 = this.s3Client(config);
        await this.audit.record({
            userId: user.id,
            action: 'backup.downloaded',
            entity: 'Backup',
            entityId: record.id,
        });
        return { record, config, s3 };
    }
    async prepareLocalExport(user) {
        await this.audit.record({
            userId: user.id,
            action: 'backup.exported',
            entity: 'Backup',
            entityId: 'local',
        });
        const workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'orderrestro-export-'));
        try {
            const dbDumpPath = path.join(workDir, 'db.dump');
            await execFileAsync('pg_dump', [
                '--format=custom',
                '--file',
                dbDumpPath,
                process.env.DATABASE_URL,
            ]);
            const uploadRoot = (0, image_upload_config_1.uploadsDir)();
            let uploadsArchivePath = null;
            if (fsSync.existsSync(uploadRoot)) {
                uploadsArchivePath = path.join(workDir, 'uploads.tar.gz');
                await execFileAsync('tar', [
                    '-czf',
                    uploadsArchivePath,
                    '-C',
                    path.dirname(uploadRoot),
                    path.basename(uploadRoot),
                ]);
            }
            return { workDir, dbDumpPath, uploadsArchivePath };
        }
        catch (err) {
            await fs.rm(workDir, { recursive: true, force: true });
            throw err;
        }
    }
    async fetchObjectStream(s3, bucket, key) {
        const res = await s3.send(new client_s3_1.GetObjectCommand({ Bucket: bucket, Key: key }));
        return res.Body;
    }
    async restore(user, id, dto) {
        this.requireOwner(user);
        if (dto.confirm !== 'RESTORE') {
            throw new common_1.BadRequestException('This is destructive. Pass confirm: "RESTORE" to proceed.');
        }
        const config = await this.requireConfig();
        const record = await this.prisma.backup.findFirst({
            where: { id, status: 'VERIFIED' },
        });
        if (!record?.s3KeyDb) {
            throw new common_1.BadRequestException('Backup not found or not in a restorable (VERIFIED) state');
        }
        const startedAt = new Date().toISOString();
        await this.audit.record({
            userId: user.id,
            action: 'backup.restore_started',
            entity: 'Backup',
            entityId: record.id,
            metadata: { backupId: record.id, startedAt },
        });
        await this.notifyOwners({
            type: 'backup.restore_started',
            title: 'Restore started',
            body: `${user.name} started restoring the database from a backup taken ${record.createdAt.toISOString()}. The app may be briefly unavailable.`,
            entity: 'Backup',
            entityId: record.id,
        });
        const s3 = this.s3Client(config);
        const workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'orderrestro-restore-'));
        const dbDumpPath = path.join(workDir, 'db.dump');
        const uploadsArchivePath = path.join(workDir, 'uploads.tar.gz');
        const uploadRoot = (0, image_upload_config_1.uploadsDir)();
        try {
            await this.downloadTo(s3, config.bucket, record.s3KeyDb, dbDumpPath);
            await execFileAsync('pg_restore', [
                '--clean',
                '--if-exists',
                '--no-owner',
                '--dbname',
                process.env.DATABASE_URL,
                dbDumpPath,
            ]);
            if (record.s3KeyUploads) {
                await this.downloadTo(s3, config.bucket, record.s3KeyUploads, uploadsArchivePath);
                const existingEntries = await fs.readdir(uploadRoot).catch(() => []);
                await Promise.all(existingEntries.map((entry) => fs.rm(path.join(uploadRoot, entry), {
                    recursive: true,
                    force: true,
                })));
                await execFileAsync('tar', [
                    '-xzf',
                    uploadsArchivePath,
                    '-C',
                    path.dirname(uploadRoot),
                ]);
            }
            const completedAt = new Date().toISOString();
            await this.audit.record({
                userId: user.id,
                action: 'backup.restored',
                entity: 'Backup',
                entityId: record.id,
                metadata: { backupId: record.id, startedAt, completedAt },
            });
            await this.notifyOwners({
                type: 'backup.restored',
                title: 'Restore completed',
                body: `Database and uploads were restored from the backup taken ${record.createdAt.toISOString()}.`,
                entity: 'Backup',
                entityId: record.id,
            });
            return { ok: true, restoredFrom: record.id };
        }
        catch (err) {
            const failureReason = err.message;
            await this.audit.record({
                userId: user.id,
                action: 'backup.restore_failed',
                entity: 'Backup',
                entityId: record.id,
                metadata: { backupId: record.id, startedAt, error: failureReason },
            });
            await this.notifyOwners({
                type: 'backup.restore_failed',
                title: 'Restore failed',
                body: failureReason,
                entity: 'Backup',
                entityId: record.id,
            });
            throw err;
        }
        finally {
            await fs.rm(workDir, { recursive: true, force: true });
        }
    }
    async notifyOwners(payload) {
        const owners = await this.prisma.user.findMany({
            where: { role: { name: 'OWNER' }, isActive: true },
            select: {
                id: true,
                branches: {
                    select: { branchId: true },
                    orderBy: { branch: { createdAt: 'asc' } },
                    take: 1,
                },
            },
        });
        for (const owner of owners) {
            const branchId = owner.branches[0]?.branchId;
            if (!branchId)
                continue;
            await this.notifications.notifyUser(owner.id, branchId, payload);
        }
    }
    async downloadBuffer(s3, bucket, key) {
        const res = await s3.send(new client_s3_1.GetObjectCommand({ Bucket: bucket, Key: key }));
        const chunks = [];
        for await (const chunk of res.Body)
            chunks.push(chunk);
        return Buffer.concat(chunks);
    }
    async downloadTo(s3, bucket, key, destPath) {
        await fs.writeFile(destPath, await this.downloadBuffer(s3, bucket, key));
    }
};
exports.BackupService = BackupService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BackupService.prototype, "checkSchedule", null);
exports.BackupService = BackupService = BackupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        notifications_service_1.NotificationsService])
], BackupService);
//# sourceMappingURL=backup.service.js.map