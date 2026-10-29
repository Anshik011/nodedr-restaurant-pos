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
exports.StaffApiKeyGuard = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const prisma_service_1 = require("../../prisma/prisma.service");
let StaffApiKeyGuard = class StaffApiKeyGuard {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
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
        const key = await this.prisma.staffApiKey.findUnique({
            where: { tokenHash },
            include: {
                user: {
                    include: {
                        role: {
                            include: { permissions: { include: { permission: true } } },
                        },
                    },
                },
            },
        });
        if (!key || key.revokedAt) {
            throw new common_1.UnauthorizedException('Invalid or revoked API key');
        }
        if (!key.user.isActive) {
            throw new common_1.UnauthorizedException('Staff account is not active');
        }
        const sessionUser = {
            id: key.user.id,
            restaurantId: key.user.restaurantId,
            name: key.user.name,
            roleId: key.user.roleId,
            roleName: key.user.role.name,
            permissions: key.user.role.permissions.map((rp) => rp.permission.key),
        };
        request.user = sessionUser;
        this.prisma.staffApiKey
            .update({ where: { id: key.id }, data: { lastUsedAt: new Date() } })
            .catch(() => undefined);
        return true;
    }
};
exports.StaffApiKeyGuard = StaffApiKeyGuard;
exports.StaffApiKeyGuard = StaffApiKeyGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StaffApiKeyGuard);
//# sourceMappingURL=staff-api-key.guard.js.map