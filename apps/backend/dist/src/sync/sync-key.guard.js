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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncKeyGuard = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const sync_service_1 = require("./sync.service");
let SyncKeyGuard = class SyncKeyGuard {
    sync;
    constructor(sync) {
        this.sync = sync;
    }
    async canActivate(ctx) {
        const req = ctx.switchToHttp().getRequest();
        const given = String(req.headers['x-sync-key'] ?? '');
        const s = await this.sync.state();
        if (s.role !== 'server' || !s.apiKey || !given)
            throw new common_1.UnauthorizedException();
        const a = Buffer.from(given);
        const b = Buffer.from(s.apiKey);
        if (a.length !== b.length || !(0, crypto_1.timingSafeEqual)(a, b))
            throw new common_1.UnauthorizedException();
        return true;
    }
};
exports.SyncKeyGuard = SyncKeyGuard;
exports.SyncKeyGuard = SyncKeyGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sync_service_1.SyncService])
], SyncKeyGuard);
//# sourceMappingURL=sync-key.guard.js.map