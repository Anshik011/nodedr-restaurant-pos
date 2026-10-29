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
var PermissionsSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsSyncService = void 0;
const common_1 = require("@nestjs/common");
const types_1 = require("@nodedr-restaurant/types");
const prisma_service_1 = require("../prisma/prisma.service");
const ALWAYS_FULL_ACCESS_ROLES = ['OWNER', 'ADMINISTRATOR'];
let PermissionsSyncService = PermissionsSyncService_1 = class PermissionsSyncService {
    prisma;
    logger = new common_1.Logger(PermissionsSyncService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        await this.sync();
    }
    async sync() {
        for (const permission of types_1.PERMISSIONS) {
            await this.prisma.permission.upsert({
                where: { key: permission.key },
                update: { label: permission.label, category: permission.category },
                create: permission,
            });
        }
        const allPermissions = await this.prisma.permission.findMany();
        const roles = await this.prisma.role.findMany({
            where: { name: { in: [...ALWAYS_FULL_ACCESS_ROLES] } },
            include: { permissions: true },
        });
        for (const role of roles) {
            const grantedIds = new Set(role.permissions.map((p) => p.permissionId));
            const missing = allPermissions.filter((p) => !grantedIds.has(p.id));
            if (missing.length === 0)
                continue;
            await this.prisma.rolePermission.createMany({
                data: missing.map((p) => ({ roleId: role.id, permissionId: p.id })),
                skipDuplicates: true,
            });
            this.logger.log(`Backfilled ${missing.length} new permission(s) onto role ${role.id} (${role.name})`);
        }
    }
};
exports.PermissionsSyncService = PermissionsSyncService;
exports.PermissionsSyncService = PermissionsSyncService = PermissionsSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PermissionsSyncService);
//# sourceMappingURL=permissions-sync.service.js.map