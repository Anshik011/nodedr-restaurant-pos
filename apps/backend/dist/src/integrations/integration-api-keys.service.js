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
exports.IntegrationApiKeysService = void 0;
const node_crypto_1 = require("node:crypto");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const branch_access_service_1 = require("../common/services/branch-access.service");
const TOKEN_PREFIX = 'ordr_ext_';
const MAX_ACTIVE_KEYS_PER_RESTAURANT = 20;
let IntegrationApiKeysService = class IntegrationApiKeysService {
    prisma;
    branchAccess;
    constructor(prisma, branchAccess) {
        this.prisma = prisma;
        this.branchAccess = branchAccess;
    }
    generateToken() {
        const raw = `${TOKEN_PREFIX}${(0, node_crypto_1.randomBytes)(24).toString('base64url')}`;
        return {
            raw,
            hash: (0, node_crypto_1.createHash)('sha256').update(raw).digest('hex'),
            lastFour: raw.slice(-4),
        };
    }
    async create(actor, dto) {
        if (dto.branchId) {
            await this.branchAccess.assertAccess(actor.restaurantId, dto.branchId);
        }
        const activeCount = await this.prisma.integrationApiKey.count({
            where: { restaurantId: actor.restaurantId, revokedAt: null },
        });
        if (activeCount >= MAX_ACTIVE_KEYS_PER_RESTAURANT) {
            throw new common_1.BadRequestException(`This restaurant already has ${MAX_ACTIVE_KEYS_PER_RESTAURANT} active integration keys — revoke one before creating another.`);
        }
        const { raw, hash, lastFour } = this.generateToken();
        const key = await this.prisma.integrationApiKey.create({
            data: {
                restaurantId: actor.restaurantId,
                branchId: dto.branchId ?? null,
                name: dto.name,
                scopes: dto.scopes,
                tokenHash: hash,
                lastFour,
                createdById: actor.id,
            },
        });
        return {
            id: key.id,
            name: key.name,
            token: raw,
            lastFour: key.lastFour,
            branchId: key.branchId,
            scopes: key.scopes,
            createdAt: key.createdAt,
        };
    }
    async list(actor) {
        const keys = await this.prisma.integrationApiKey.findMany({
            where: { restaurantId: actor.restaurantId },
            include: { branch: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
        });
        return keys.map((key) => ({
            id: key.id,
            name: key.name,
            lastFour: key.lastFour,
            branch: key.branch,
            scopes: key.scopes,
            createdAt: key.createdAt,
            lastUsedAt: key.lastUsedAt,
            revokedAt: key.revokedAt,
        }));
    }
    async revoke(actor, id) {
        const key = await this.prisma.integrationApiKey.findFirst({
            where: { id, restaurantId: actor.restaurantId },
        });
        if (!key)
            throw new common_1.NotFoundException('API key not found');
        if (!key.revokedAt) {
            await this.prisma.integrationApiKey.update({
                where: { id },
                data: { revokedAt: new Date() },
            });
        }
        return { ok: true };
    }
};
exports.IntegrationApiKeysService = IntegrationApiKeysService;
exports.IntegrationApiKeysService = IntegrationApiKeysService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        branch_access_service_1.BranchAccessService])
], IntegrationApiKeysService);
//# sourceMappingURL=integration-api-keys.service.js.map