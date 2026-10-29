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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("../audit/audit.service");
const prisma_service_1 = require("../prisma/prisma.service");
const SELECT = {
    id: true,
    name: true,
    label: true,
    isSystem: true,
    createdAt: true,
    permissions: {
        select: {
            permission: { select: { key: true, label: true, category: true } },
        },
    },
};
let RolesService = class RolesService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    list(restaurantId) {
        return this.prisma.role.findMany({
            where: { restaurantId },
            select: SELECT,
            orderBy: { label: 'asc' },
        });
    }
    async create(restaurantId, actorId, dto) {
        const permissions = await this.assertPermissionKeysValid(dto.permissionKeys);
        const role = await this.prisma.role.create({
            data: {
                restaurantId,
                name: dto.name,
                label: dto.label,
                isSystem: false,
                permissions: {
                    create: permissions.map((p) => ({ permissionId: p.id })),
                },
            },
            select: SELECT,
        });
        await this.audit.record({
            userId: actorId,
            action: 'role.created',
            entity: 'Role',
            entityId: role.id,
            metadata: {
                name: role.name,
                label: role.label,
                permissionKeys: dto.permissionKeys,
            },
        });
        return role;
    }
    async update(restaurantId, actorId, id, dto) {
        const existing = await this.getForRestaurant(restaurantId, id);
        const nextPermissions = dto.permissionKeys
            ? await this.assertPermissionKeysValid(dto.permissionKeys)
            : undefined;
        const updated = await this.prisma.$transaction(async (tx) => {
            if (nextPermissions) {
                const currentKeys = new Set(existing.permissions.map((p) => p.permission.key));
                const nextKeys = new Set(nextPermissions.map((p) => p.key));
                const toAdd = nextPermissions.filter((p) => !currentKeys.has(p.key));
                const toRemoveKeys = [...currentKeys].filter((key) => !nextKeys.has(key));
                if (toRemoveKeys.length > 0) {
                    await tx.rolePermission.deleteMany({
                        where: { roleId: id, permission: { key: { in: toRemoveKeys } } },
                    });
                }
                if (toAdd.length > 0) {
                    await tx.rolePermission.createMany({
                        data: toAdd.map((p) => ({ roleId: id, permissionId: p.id })),
                        skipDuplicates: true,
                    });
                }
            }
            return tx.role.update({
                where: { id },
                data: { label: dto.label },
                select: SELECT,
            });
        });
        await this.audit.record({
            userId: actorId,
            action: 'role.updated',
            entity: 'Role',
            entityId: id,
            metadata: { label: dto.label, permissionKeys: dto.permissionKeys },
        });
        return updated;
    }
    async remove(restaurantId, actorId, id) {
        const existing = await this.getForRestaurant(restaurantId, id);
        if (existing.isSystem) {
            throw new common_1.BadRequestException('Seeded system roles cannot be deleted — create a custom role instead');
        }
        const assignedCount = await this.prisma.user.count({
            where: { roleId: id },
        });
        if (assignedCount > 0) {
            throw new common_1.ConflictException(`Cannot delete this role — ${assignedCount} staff account(s) are still assigned to it`);
        }
        await this.prisma.role.delete({ where: { id } });
        await this.audit.record({
            userId: actorId,
            action: 'role.deleted',
            entity: 'Role',
            entityId: id,
            metadata: { name: existing.name, label: existing.label },
        });
        return { ok: true };
    }
    async getForRestaurant(restaurantId, id) {
        const role = await this.prisma.role.findFirst({
            where: { id, restaurantId },
            select: SELECT,
        });
        if (!role)
            throw new common_1.NotFoundException('Role not found');
        return role;
    }
    async assertPermissionKeysValid(keys) {
        if (keys.length === 0)
            return [];
        const found = await this.prisma.permission.findMany({
            where: { key: { in: keys } },
            select: { id: true, key: true },
        });
        if (found.length !== new Set(keys).size) {
            const foundKeys = new Set(found.map((p) => p.key));
            const invalid = keys.filter((key) => !foundKeys.has(key));
            throw new common_1.BadRequestException(`Unknown permission key(s): ${invalid.join(', ')}`);
        }
        return found;
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], RolesService);
//# sourceMappingURL=roles.service.js.map