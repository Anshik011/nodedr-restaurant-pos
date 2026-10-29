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
exports.DownloadsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const downloads_service_1 = require("./downloads.service");
let DownloadsController = class DownloadsController {
    downloads;
    constructor(downloads) {
        this.downloads = downloads;
    }
    stats() {
        return this.downloads.stats();
    }
    async go(channel, res) {
        const url = await this.downloads.recordAndResolve(channel);
        res.redirect(302, url);
    }
};
exports.DownloadsController = DownloadsController;
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DownloadsController.prototype, "stats", null);
__decorate([
    (0, throttler_1.Throttle)({ default: { limit: 20, ttl: 60_000 } }),
    (0, common_1.Get)('go/:channel'),
    __param(0, (0, common_1.Param)('channel')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DownloadsController.prototype, "go", null);
exports.DownloadsController = DownloadsController = __decorate([
    (0, swagger_1.ApiTags)('downloads'),
    (0, common_1.Controller)('v1/downloads'),
    __metadata("design:paramtypes", [downloads_service_1.DownloadsService])
], DownloadsController);
//# sourceMappingURL=downloads.controller.js.map