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
exports.IntegrationApiKeyGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const node_crypto_1 = require("node:crypto");
const prisma_service_1 = require("../../prisma/prisma.service");
const require_scope_decorator_1 = require("../decorators/require-scope.decorator");
let IntegrationApiKeyGuard = class IntegrationApiKeyGuard {
    prisma;
    reflector;
    constructor(prisma, reflector) {
        this.prisma = prisma;
        this.reflector = reflector;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const header = request.headers.authorization;
        const rawToken = header?.startsWith('Bearer ')
            ? header.slice('Bearer '.length).trim()
            : null;
        if (!rawToken) {
            throw new common_1.UnauthorizedException('Missing Authorization: Bearer <api key> header');
        }
        const tokenHash = (0, node_crypto_1.createHash)('sha256').update(rawToken).digest('hex');
        const key = await this.prisma.integrationApiKey.findUnique({
            where: { tokenHash },
        });
        if (!key || key.revokedAt) {
            throw new common_1.UnauthorizedException('Invalid or revoked API key');
        }
        const required = this.reflector.getAllAndOverride(require_scope_decorator_1.INTEGRATION_SCOPES_KEY, [context.getHandler(), context.getClass()]);
        if (required?.length) {
            const missing = required.filter((scope) => !key.scopes.includes(scope));
            if (missing.length > 0) {
                throw new common_1.ForbiddenException(`This API key is missing required scope(s): ${missing.join(', ')}`);
            }
        }
        request.integrationKey = {
            id: key.id,
            restaurantId: key.restaurantId,
            branchId: key.branchId,
            scopes: key.scopes,
        };
        this.prisma.integrationApiKey
            .update({ where: { id: key.id }, data: { lastUsedAt: new Date() } })
            .catch(() => undefined);
        return true;
    }
};
exports.IntegrationApiKeyGuard = IntegrationApiKeyGuard;
exports.IntegrationApiKeyGuard = IntegrationApiKeyGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        core_1.Reflector])
], IntegrationApiKeyGuard);
//# sourceMappingURL=integration-api-key.guard.js.map