"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var UpdateService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateService = void 0;
const common_1 = require("@nestjs/common");
const GITHUB_REPO = 'Anshik011/nodedr-restaurant-pos';
const CACHE_TTL_MS = 60 * 60 * 1000;
const BUILDING_CACHE_TTL_MS = 60 * 1000;
let UpdateService = UpdateService_1 = class UpdateService {
    logger = new common_1.Logger(UpdateService_1.name);
    cache = null;
    cacheExpiresAt = 0;
    async checkForUpdate() {
        if (this.cache && Date.now() < this.cacheExpiresAt) {
            return this.cache;
        }
        const currentVersion = (process.env.APP_VERSION ?? '').trim() || 'dev';
        let latestVersion = null;
        try {
            latestVersion = await this.fetchLatestTag();
        }
        catch (err) {
            this.logger.warn(`update check failed: ${err instanceof Error ? err.message : String(err)}`);
        }
        let imagePublished = true;
        if (latestVersion && process.env.UPDATER_URL) {
            imagePublished = (await this.imageTagExists(latestVersion)) !== false;
        }
        const newer = latestVersion !== null &&
            (currentVersion === 'dev'
                ? !!process.env.UPDATER_URL
                : isNewer(latestVersion, currentVersion));
        const info = {
            currentVersion,
            latestVersion,
            updateAvailable: newer && imagePublished,
            building: newer && !imagePublished,
            releaseUrl: latestVersion
                ? `https://github.com/${GITHUB_REPO}/releases/tag/${latestVersion}`
                : null,
            checkedAt: new Date().toISOString(),
        };
        this.cache = info;
        this.cacheExpiresAt =
            Date.now() +
                (info.building || latestVersion === null
                    ? BUILDING_CACHE_TTL_MS
                    : CACHE_TTL_MS);
        return info;
    }
    async applyUpdate() {
        const base = (process.env.UPDATER_URL ?? '').trim().replace(/\/$/, '');
        if (!base) {
            throw new common_1.BadRequestException('This install has no updater. Update the app the way you installed it.');
        }
        this.cache = null;
        const info = await this.checkForUpdate();
        if (!info.updateAvailable || !info.latestVersion) {
            throw new common_1.ConflictException('You are already on the latest version');
        }
        let res;
        try {
            res = await fetch(`${base}/v1/update`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${process.env.UPDATER_TOKEN ?? ''}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    version: info.latestVersion.replace(/^v/i, ''),
                }),
                signal: AbortSignal.timeout(10000),
            });
        }
        catch (err) {
            throw new common_1.InternalServerErrorException(`could not reach the updater: ${err instanceof Error ? err.message : String(err)}`);
        }
        if (!res.ok) {
            const body = (await res.json().catch(() => ({})));
            throw new common_1.InternalServerErrorException(`updater refused: ${body.error ?? res.status}`);
        }
        return {
            status: 'update started',
            message: 'The application is updating and will restart shortly. This page will reload when it is back.',
        };
    }
    async getProgress() {
        const base = (process.env.UPDATER_URL ?? '').trim().replace(/\/$/, '');
        if (!base)
            return { state: 'unavailable' };
        try {
            const res = await fetch(`${base}/v1/status`, {
                headers: { Authorization: `Bearer ${process.env.UPDATER_TOKEN ?? ''}` },
                signal: AbortSignal.timeout(5000),
            });
            if (!res.ok)
                return { state: 'unknown' };
            return (await res.json());
        }
        catch {
            return { state: 'unknown' };
        }
    }
    async imageTagExists(tag) {
        try {
            const repo = 'anshik011/nodedr-restaurant-pos-backend';
            const version = tag.replace(/^v/i, '');
            const tokRes = await fetch(`https://ghcr.io/token?scope=repository:${repo}:pull`, { signal: AbortSignal.timeout(6000) });
            if (!tokRes.ok)
                return null;
            const { token } = (await tokRes.json());
            const res = await fetch(`https://ghcr.io/v2/${repo}/manifests/${version}`, {
                method: 'HEAD',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.oci.image.index.v1+json, application/vnd.docker.distribution.manifest.list.v2+json',
                },
                signal: AbortSignal.timeout(6000),
            });
            if (res.status === 404)
                return false;
            return res.ok ? true : null;
        }
        catch {
            return null;
        }
    }
    async fetchLatestTag() {
        const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/tags?per_page=1`, {
            headers: {
                Accept: 'application/vnd.github+json',
                'User-Agent': 'uptoware-restaurant-pos-update-check',
            },
            signal: AbortSignal.timeout(5000),
        });
        if (!res.ok)
            return null;
        const tags = (await res.json());
        return tags[0]?.name ?? null;
    }
};
exports.UpdateService = UpdateService;
exports.UpdateService = UpdateService = UpdateService_1 = __decorate([
    (0, common_1.Injectable)()
], UpdateService);
function parseSemver(v) {
    const parts = v
        .replace(/^v/i, '')
        .split('.')
        .map((n) => parseInt(n, 10));
    return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}
function isNewer(latest, current) {
    const [la, lb, lc] = parseSemver(latest);
    const [ca, cb, cc] = parseSemver(current);
    if (la !== ca)
        return la > ca;
    if (lb !== cb)
        return lb > cb;
    return lc > cc;
}
//# sourceMappingURL=update.service.js.map