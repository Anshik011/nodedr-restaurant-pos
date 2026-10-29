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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwoFactorService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const audit_service_1 = require("../audit/audit.service");
const prisma_service_1 = require("../prisma/prisma.service");
const totp_1 = require("./totp");
const MAX_FAILURES = 5;
const LOCK_MS = 15 * 60_000;
const RECOVERY_CODES = 8;
let TwoFactorService = class TwoFactorService {
    prisma;
    config;
    audit;
    failures = new Map();
    constructor(prisma, config, audit) {
        this.prisma = prisma;
        this.config = config;
        this.audit = audit;
    }
    get keyMaterial() {
        return (this.config.get('TWO_FACTOR_KEY') ??
            this.config.getOrThrow('JWT_SECRET'));
    }
    assertNotLocked(userId) {
        const f = this.failures.get(userId);
        if (f && f.count >= MAX_FAILURES && Date.now() < f.until)
            throw new common_1.UnauthorizedException('Too many incorrect codes. Try again in 15 minutes.');
    }
    fail(userId) {
        const f = this.failures.get(userId);
        const fresh = !f || Date.now() >= f.until;
        this.failures.set(userId, {
            count: fresh ? 1 : f.count + 1,
            until: Date.now() + LOCK_MS,
        });
        throw new common_1.UnauthorizedException('Invalid verification code');
    }
    async verifyLogin(user, code) {
        if (!code)
            throw new common_1.UnauthorizedException('TWO_FACTOR_REQUIRED');
        this.assertNotLocked(user.id);
        const trimmed = code.trim();
        if (/^\d{6}$/.test(trimmed) && user.twoFactorSecret) {
            let plain = null;
            try {
                plain = (0, totp_1.openSecret)(user.twoFactorSecret, this.keyMaterial);
            }
            catch {
                plain = null;
            }
            const step = plain ? (0, totp_1.verifyTotp)(plain, trimmed) : null;
            if (step != null && step > (user.twoFactorLastStep ?? 0)) {
                const { count } = await this.prisma.user.updateMany({
                    where: {
                        id: user.id,
                        OR: [
                            { twoFactorLastStep: null },
                            { twoFactorLastStep: { lt: step } },
                        ],
                    },
                    data: { twoFactorLastStep: step },
                });
                if (count === 1) {
                    this.failures.delete(user.id);
                    return;
                }
            }
            this.fail(user.id);
        }
        if (await this.consumeRecoveryCode(user, trimmed)) {
            this.failures.delete(user.id);
            return;
        }
        this.fail(user.id);
    }
    async consumeRecoveryCode(user, input) {
        const normalised = input.toUpperCase().replace(/[\s-]/g, '');
        for (const hash of user.twoFactorRecoveryHashes) {
            if (await bcrypt.compare(normalised, hash)) {
                const { count } = await this.prisma.user.updateMany({
                    where: { id: user.id, twoFactorRecoveryHashes: { has: hash } },
                    data: {
                        twoFactorRecoveryHashes: user.twoFactorRecoveryHashes.filter((h) => h !== hash),
                    },
                });
                return count === 1;
            }
        }
        return false;
    }
    async status(userId) {
        const u = await this.prisma.user.findUniqueOrThrow({
            where: { id: userId },
            select: { twoFactorEnabled: true, twoFactorRecoveryHashes: true },
        });
        return {
            enabled: u.twoFactorEnabled,
            recoveryCodesLeft: u.twoFactorRecoveryHashes.length,
        };
    }
    async setup(userId) {
        const u = await this.prisma.user.findUniqueOrThrow({
            where: { id: userId },
            select: {
                email: true,
                name: true,
                twoFactorEnabled: true,
                restaurant: { select: { name: true } },
            },
        });
        if (u.twoFactorEnabled)
            throw new common_1.BadRequestException('Two-factor authentication is already on');
        const secret = (0, totp_1.generateSecret)();
        await this.prisma.user.update({
            where: { id: userId },
            data: { twoFactorSecret: (0, totp_1.sealSecret)(secret, this.keyMaterial) },
        });
        return {
            secret,
            otpauthUrl: (0, totp_1.otpauthUrl)(secret, u.email ?? u.name, u.restaurant.name),
        };
    }
    async enable(userId, code) {
        const u = await this.prisma.user.findUniqueOrThrow({
            where: { id: userId },
            select: { twoFactorEnabled: true, twoFactorSecret: true },
        });
        if (u.twoFactorEnabled)
            throw new common_1.BadRequestException('Two-factor authentication is already on');
        if (!u.twoFactorSecret)
            throw new common_1.BadRequestException('Start setup first');
        this.assertNotLocked(userId);
        const step = (0, totp_1.verifyTotp)((0, totp_1.openSecret)(u.twoFactorSecret, this.keyMaterial), code);
        if (step == null)
            this.fail(userId);
        const codes = Array.from({ length: RECOVERY_CODES }, totp_1.generateRecoveryCode);
        const hashes = await Promise.all(codes.map((c) => bcrypt.hash(c.replace(/-/g, ''), 10)));
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: true,
                twoFactorLastStep: step,
                twoFactorRecoveryHashes: hashes,
            },
        });
        this.failures.delete(userId);
        await this.audit.record({
            userId,
            action: '2fa.enabled',
            entity: 'User',
            entityId: userId,
        });
        return { recoveryCodes: codes };
    }
    async disable(userId, password, code) {
        const u = await this.prisma.user.findUniqueOrThrow({
            where: { id: userId },
        });
        if (!u.twoFactorEnabled)
            throw new common_1.BadRequestException('Two-factor authentication is not on');
        if (!(await bcrypt.compare(password, u.passwordHash)))
            throw new common_1.UnauthorizedException('Incorrect password');
        await this.verifyLogin(u, code);
        await this.clear(userId);
        await this.audit.record({
            userId,
            action: '2fa.disabled',
            entity: 'User',
            entityId: userId,
        });
        return { ok: true };
    }
    async adminReset(actorId, restaurantId, targetUserId) {
        const target = await this.prisma.user.findFirst({
            where: { id: targetUserId, restaurantId },
            select: { id: true },
        });
        if (!target)
            throw new common_1.BadRequestException('Staff member not found');
        await this.clear(targetUserId);
        await this.audit.record({
            userId: actorId,
            action: '2fa.reset',
            entity: 'User',
            entityId: targetUserId,
        });
        return { ok: true };
    }
    async clear(userId) {
        this.failures.delete(userId);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: false,
                twoFactorSecret: null,
                twoFactorLastStep: null,
                twoFactorRecoveryHashes: [],
            },
        });
    }
};
exports.TwoFactorService = TwoFactorService;
exports.TwoFactorService = TwoFactorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        audit_service_1.AuditService])
], TwoFactorService);
//# sourceMappingURL=two-factor.service.js.map