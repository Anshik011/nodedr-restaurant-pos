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
exports.DownloadsService = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const DOWNLOAD_CHANNELS = {
    github: 'https://github.com/Anshik011/nodedr-restaurant-pos',
    'install-script': 'https://raw.githubusercontent.com/Anshik011/nodedr-restaurant-pos/master/install.sh',
    docker: 'https://github.com/Anshik011/nodedr-restaurant-pos#one-click-install',
    casaos: 'https://github.com/IceWhaleTech/CasaOS-AppStore',
};
let DownloadsService = class DownloadsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    resolveChannel(channel) {
        const url = DOWNLOAD_CHANNELS[channel];
        if (!url)
            throw new common_1.NotFoundException('Unknown download channel');
        return url;
    }
    async recordAndResolve(channel) {
        const url = this.resolveChannel(channel);
        await this.prisma.downloadStat.upsert({
            where: { channel },
            create: { channel, count: 1 },
            update: { count: { increment: 1 } },
        });
        return url;
    }
    async stats() {
        const rows = await this.prisma.downloadStat.findMany({
            orderBy: { channel: 'asc' },
        });
        const byChannel = new Map(rows.map((r) => [r.channel, r.count]));
        return Object.keys(DOWNLOAD_CHANNELS).map((channel) => ({
            channel,
            count: byChannel.get(channel) ?? 0,
        }));
    }
};
exports.DownloadsService = DownloadsService;
exports.DownloadsService = DownloadsService = __decorate([
    (0, common_2.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DownloadsService);
//# sourceMappingURL=downloads.service.js.map