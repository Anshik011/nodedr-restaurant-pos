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
exports.SettingsService = void 0;
const crypto_1 = require("crypto");
const common_1 = require("@nestjs/common");
const types_1 = require("@nodedr-restaurant/types");
const audit_service_1 = require("../../audit/audit.service");
const prisma_service_1 = require("../../prisma/prisma.service");
let SettingsService = class SettingsService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async get(restaurantId, branchId) {
        const restaurant = await this.prisma.restaurant.findUnique({
            where: { id: restaurantId },
        });
        const branch = await this.prisma.branch.findFirst({
            where: { id: branchId, restaurantId },
        });
        if (!restaurant || !branch) {
            throw new common_1.NotFoundException('Restaurant or branch not found');
        }
        return { restaurant, branch };
    }
    async updateRestaurant(restaurantId, userId, dto) {
        const updated = await this.prisma.restaurant.update({
            where: { id: restaurantId },
            data: dto,
        });
        await this.audit.record({
            userId,
            action: 'settings.restaurant_updated',
            entity: 'Restaurant',
            entityId: restaurantId,
            metadata: { changes: dto },
        });
        return updated;
    }
    async updateBranch(branchId, userId, dto) {
        if (dto.kioskDineInEnabled !== undefined ||
            dto.kioskTakeawayEnabled !== undefined) {
            const current = await this.prisma.branch.findUnique({
                where: { id: branchId },
                select: { kioskDineInEnabled: true, kioskTakeawayEnabled: true },
            });
            const dineIn = dto.kioskDineInEnabled ?? current?.kioskDineInEnabled;
            const takeaway = dto.kioskTakeawayEnabled ?? current?.kioskTakeawayEnabled;
            if (!dineIn && !takeaway) {
                throw new common_1.BadRequestException('The kiosk needs at least one of dine-in or takeaway');
            }
        }
        if (dto.printerConnection === 'NETWORK' || dto.printerHost !== undefined) {
            const current = await this.prisma.branch.findUnique({
                where: { id: branchId },
                select: { printerConnection: true, printerHost: true },
            });
            const connection = dto.printerConnection ?? current?.printerConnection;
            const host = dto.printerHost !== undefined ? dto.printerHost : current?.printerHost;
            if (connection === 'NETWORK' && !host) {
                throw new common_1.BadRequestException('Enter the printer address (IP or host name) for network printing');
            }
        }
        const data = dto.taxRegime && dto.taxMode === undefined
            ? { ...dto, taxMode: types_1.TAX_REGIME_PRESETS[dto.taxRegime].defaultMode }
            : dto;
        const updated = await this.prisma.branch.update({
            where: { id: branchId },
            data,
        });
        await this.audit.record({
            userId,
            action: 'settings.branch_updated',
            entity: 'Branch',
            entityId: branchId,
            metadata: { changes: dto },
        });
        return updated;
    }
    async setKioskToken(branchId, userId, action) {
        const branch = await this.prisma.branch.findUnique({
            where: { id: branchId },
            select: { kioskToken: true },
        });
        if (!branch)
            throw new common_1.NotFoundException('Branch not found');
        const kioskToken = action === 'disable'
            ? null
            : action === 'enable' && branch.kioskToken
                ? branch.kioskToken
                : (0, crypto_1.randomBytes)(16).toString('hex');
        await this.prisma.branch.update({
            where: { id: branchId },
            data: { kioskToken },
        });
        await this.audit.record({
            userId,
            action: `settings.kiosk_${action}`,
            entity: 'Branch',
            entityId: branchId,
            metadata: { enabled: kioskToken !== null },
        });
        return { kioskToken };
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map