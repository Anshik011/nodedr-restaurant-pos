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
exports.StaffApiKeysService = void 0;
const node_crypto_1 = require("node:crypto");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const TOKEN_PREFIX = 'ordr_staff_';
const MAX_ACTIVE_KEYS_PER_USER = 10;
let StaffApiKeysService = class StaffApiKeysService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
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
        const activeCount = await this.prisma.staffApiKey.count({
            where: { userId: actor.id, revokedAt: null },
        });
        if (activeCount >= MAX_ACTIVE_KEYS_PER_USER) {
            throw new common_1.BadRequestException(`You already have ${MAX_ACTIVE_KEYS_PER_USER} active API keys — revoke one before creating another.`);
        }
        const { raw, hash, lastFour } = this.generateToken();
        const key = await this.prisma.staffApiKey.create({
            data: { userId: actor.id, name: dto.name, tokenHash: hash, lastFour },
        });
        return {
            id: key.id,
            name: key.name,
            token: raw,
            lastFour: key.lastFour,
            createdAt: key.createdAt,
        };
    }
    async list(actor) {
        const keys = await this.prisma.staffApiKey.findMany({
            where: { userId: actor.id },
            orderBy: { createdAt: 'desc' },
        });
        return keys.map((key) => ({
            id: key.id,
            name: key.name,
            lastFour: key.lastFour,
            createdAt: key.createdAt,
            lastUsedAt: key.lastUsedAt,
            revokedAt: key.revokedAt,
        }));
    }
    async revoke(actor, id) {
        const key = await this.prisma.staffApiKey.findUnique({ where: { id } });
        if (!key)
            throw new common_1.NotFoundException('API key not found');
        if (key.userId !== actor.id) {
            throw new common_1.ForbiddenException('You can only revoke your own API keys');
        }
        if (!key.revokedAt) {
            await this.prisma.staffApiKey.update({
                where: { id },
                data: { revokedAt: new Date() },
            });
        }
        return { ok: true };
    }
};
exports.StaffApiKeysService = StaffApiKeysService;
exports.StaffApiKeysService = StaffApiKeysService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StaffApiKeysService);
//# sourceMappingURL=staff-api-keys.service.js.map