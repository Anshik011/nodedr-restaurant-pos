"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncController = exports.SyncPeerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_decorator_1 = require("../common/decorators/auth.decorator");
const sync_key_guard_1 = require("./sync-key.guard");
const sync_service_1 = require("./sync.service");
let SyncPeerController = class SyncPeerController {
    sync;
    constructor(sync) {
        this.sync = sync;
    }
    async ping() {
        return {
            ok: true,
            role: 'server',
            schema: await this.sync.schemaVersion(),
        };
    }
    pull(since = '0', device = '') {
        if (!/^\d+$/.test(since) || !device)
            throw new common_1.BadRequestException('since and device are required');
        return this.sync.pull(BigInt(since), device);
    }
    push(body) {
        if (!body?.device || !Array.isArray(body.changes))
            throw new common_1.BadRequestException('device and changes are required');
        return this.sync.push(body.device, body.changes);
    }
};
exports.SyncPeerController = SyncPeerController;
__decorate([
    (0, common_1.Get)('ping'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SyncPeerController.prototype, "ping", null);
__decorate([
    (0, common_1.Get)('pull'),
    __param(0, (0, common_1.Query)('since')),
    __param(1, (0, common_1.Query)('device')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SyncPeerController.prototype, "pull", null);
__decorate([
    (0, common_1.Post)('push'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SyncPeerController.prototype, "push", null);
exports.SyncPeerController = SyncPeerController = __decorate([
    (0, swagger_1.ApiTags)('sync'),
    (0, common_1.Controller)('v1/sync-peer'),
    (0, common_1.UseGuards)(sync_key_guard_1.SyncKeyGuard),
    __metadata("design:paramtypes", [sync_service_1.SyncService])
], SyncPeerController);
let SyncController = class SyncController {
    sync;
    constructor(sync) {
        this.sync = sync;
    }
    status() {
        return this.sync.publicStatus();
    }
    async test(body) {
        try {
            return await this.sync.testConnection(this.url(body), this.key(body));
        }
        catch (e) {
            throw new common_1.BadRequestException(e instanceof Error ? e.message : 'Connection failed');
        }
    }
    async enable(body) {
        if (body.mode !== 'adopt' && body.mode !== 'merge')
            throw new common_1.BadRequestException('mode must be adopt or merge');
        try {
            await this.sync.enable(this.url(body), this.key(body), body.mode);
        }
        catch (e) {
            throw new common_1.BadRequestException(e instanceof Error ? e.message : 'Sync failed');
        }
        return this.sync.publicStatus();
    }
    async run() {
        try {
            const r = await this.sync.runOnce();
            return { ...r, ...(await this.sync.publicStatus()) };
        }
        catch (e) {
            throw new common_1.BadRequestException(e instanceof Error ? e.message : 'Sync failed');
        }
    }
    async disable() {
        await this.sync.disable();
        return this.sync.publicStatus();
    }
    url(b) {
        const u = (b.serverUrl ?? '').trim();
        if (!/^https?:\/\/[^\s]+$/i.test(u))
            throw new common_1.BadRequestException('Enter the server address, e.g. https://orders.example.com');
        return u;
    }
    key(b) {
        const k = (b.apiKey ?? '').trim();
        if (k.length < 16)
            throw new common_1.BadRequestException('Sync key must be at least 16 characters');
        return k;
    }
};
exports.SyncController = SyncController;
__decorate([
    (0, auth_decorator_1.Auth)('settings.manage'),
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SyncController.prototype, "status", null);
__decorate([
    (0, auth_decorator_1.Auth)('settings.manage'),
    (0, common_1.Post)('test'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "test", null);
__decorate([
    (0, auth_decorator_1.Auth)('settings.manage'),
    (0, common_1.Put)('settings'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "enable", null);
__decorate([
    (0, auth_decorator_1.Auth)('settings.manage'),
    (0, common_1.Post)('run'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "run", null);
__decorate([
    (0, auth_decorator_1.Auth)('settings.manage'),
    (0, common_1.Post)('disable'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "disable", null);
exports.SyncController = SyncController = __decorate([
    (0, swagger_1.ApiTags)('sync'),
    (0, common_1.Controller)('v1/sync'),
    __metadata("design:paramtypes", [sync_service_1.SyncService])
], SyncController);
//# sourceMappingURL=sync.controller.js.map