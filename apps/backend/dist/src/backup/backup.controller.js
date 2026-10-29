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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const archiver_1 = __importDefault(require("archiver"));
const fs = __importStar(require("node:fs/promises"));
const types_1 = require("@nodedr-restaurant/types");
const auth_decorator_1 = require("../common/decorators/auth.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const zod_validation_pipe_1 = require("../common/pipes/zod-validation.pipe");
const backup_service_1 = require("./backup.service");
let BackupController = class BackupController {
    backupService;
    constructor(backupService) {
        this.backupService = backupService;
    }
    status() {
        return this.backupService.status();
    }
    list() {
        return this.backupService.list();
    }
    setConfig(user, body) {
        return this.backupService.setConfig(user, body);
    }
    clearConfig(user) {
        return this.backupService.clearConfig(user);
    }
    trigger(user) {
        return this.backupService.triggerManual(user);
    }
    restore(user, id, body) {
        return this.backupService.restore(user, id, body);
    }
    async exportLocal(user, res) {
        const { workDir, dbDumpPath, uploadsArchivePath } = await this.backupService.prepareLocalExport(user);
        const filename = `orderrestro-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.zip`;
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        const cleanup = () => {
            void fs.rm(workDir, { recursive: true, force: true });
        };
        res.on('close', cleanup);
        const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
        archive.on('error', (err) => res.destroy(err));
        archive.pipe(res);
        archive.file(dbDumpPath, { name: 'db.dump' });
        if (uploadsArchivePath) {
            archive.file(uploadsArchivePath, { name: 'uploads.tar.gz' });
        }
        await archive.finalize();
    }
    async download(user, id, res) {
        const { record, config, s3 } = await this.backupService.prepareDownload(user, id);
        const filename = `backup-${record.createdAt.toISOString().replace(/[:.]/g, '-')}.zip`;
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
        archive.on('error', (err) => res.destroy(err));
        archive.pipe(res);
        if (record.s3KeyDb) {
            const dbStream = await this.backupService.fetchObjectStream(s3, config.bucket, record.s3KeyDb);
            archive.append(dbStream, { name: 'db.dump' });
        }
        if (record.s3KeyUploads) {
            const uploadsStream = await this.backupService.fetchObjectStream(s3, config.bucket, record.s3KeyUploads);
            archive.append(uploadsStream, { name: 'uploads.tar.gz' });
        }
        await archive.finalize();
    }
};
exports.BackupController = BackupController;
__decorate([
    (0, auth_decorator_1.Auth)('backup.manage'),
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BackupController.prototype, "status", null);
__decorate([
    (0, auth_decorator_1.Auth)('backup.manage'),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BackupController.prototype, "list", null);
__decorate([
    (0, auth_decorator_1.Auth)('backup.manage'),
    (0, common_1.Post)('config'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.setBackupConfigSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], BackupController.prototype, "setConfig", null);
__decorate([
    (0, auth_decorator_1.Auth)('backup.manage'),
    (0, common_1.Delete)('config'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BackupController.prototype, "clearConfig", null);
__decorate([
    (0, auth_decorator_1.Auth)('backup.manage'),
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BackupController.prototype, "trigger", null);
__decorate([
    (0, auth_decorator_1.Auth)('backup.manage'),
    (0, common_1.Post)(':id/restore'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.restoreBackupSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], BackupController.prototype, "restore", null);
__decorate([
    (0, auth_decorator_1.Auth)('backup.manage'),
    (0, common_1.Get)('export'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "exportLocal", null);
__decorate([
    (0, auth_decorator_1.Auth)('backup.manage'),
    (0, common_1.Get)(':id/download'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "download", null);
exports.BackupController = BackupController = __decorate([
    (0, swagger_1.ApiTags)('backups'),
    (0, common_1.Controller)('v1/backups'),
    __metadata("design:paramtypes", [backup_service_1.BackupService])
], BackupController);
//# sourceMappingURL=backup.controller.js.map