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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const audit_service_1 = require("../../audit/audit.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const SELECT = {
    id: true,
    name: true,
    email: true,
    phone: true,
    isActive: true,
    createdAt: true,
    roleId: true,
    role: { select: { id: true, name: true, label: true } },
    branches: { select: { branch: { select: { id: true, name: true } } } },
};
let UsersService = class UsersService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    list(restaurantId) {
        return this.prisma.user.findMany({
            where: { restaurantId },
            select: SELECT,
            orderBy: { createdAt: 'asc' },
        });
    }
    listRoles(restaurantId) {
        return this.prisma.role.findMany({
            where: { restaurantId },
            orderBy: { label: 'asc' },
        });
    }
    async create(restaurantId, actorId, dto) {
        await this.assertRoleInRestaurant(restaurantId, dto.roleId);
        await this.assertBranchesInRestaurant(restaurantId, dto.branchIds);
        if (dto.email) {
            const existing = await this.prisma.user.findFirst({
                where: { restaurantId, email: dto.email },
            });
            if (existing) {
                throw new common_1.ConflictException('A staff account with this email already exists');
            }
        }
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const user = await this.prisma.user.create({
            data: {
                restaurantId,
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                roleId: dto.roleId,
                passwordHash,
                branches: {
                    create: dto.branchIds.map((branchId) => ({ branchId })),
                },
            },
            select: SELECT,
        });
        await this.audit.record({
            userId: actorId,
            action: 'staff.created',
            entity: 'User',
            entityId: user.id,
            metadata: { name: user.name, email: user.email, roleId: user.roleId },
        });
        return user;
    }
    async update(restaurantId, actorId, id, dto) {
        const existing = await this.prisma.user.findFirst({
            where: { id, restaurantId },
            include: { role: true },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Staff account not found');
        }
        if ((dto.isActive === false || dto.roleId) &&
            existing.role.name === 'OWNER') {
            const otherActiveOwners = await this.prisma.user.count({
                where: {
                    restaurantId,
                    isActive: true,
                    id: { not: id },
                    role: { name: 'OWNER' },
                },
            });
            if (otherActiveOwners === 0) {
                throw new common_1.BadRequestException('Cannot disable or change the role of the last active owner');
            }
        }
        if (dto.roleId) {
            await this.assertRoleInRestaurant(restaurantId, dto.roleId);
        }
        if (dto.branchIds) {
            await this.assertBranchesInRestaurant(restaurantId, dto.branchIds);
        }
        const passwordHash = dto.password
            ? await bcrypt.hash(dto.password, 12)
            : undefined;
        const updated = await this.prisma.user.update({
            where: { id },
            data: {
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                roleId: dto.roleId,
                isActive: dto.isActive,
                passwordHash,
                ...(dto.branchIds
                    ? {
                        branches: {
                            deleteMany: {},
                            create: dto.branchIds.map((branchId) => ({ branchId })),
                        },
                    }
                    : {}),
            },
            select: SELECT,
        });
        await this.audit.record({
            userId: actorId,
            action: 'staff.updated',
            entity: 'User',
            entityId: id,
            metadata: {
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                roleId: dto.roleId,
                isActive: dto.isActive,
                branchIds: dto.branchIds,
                passwordChanged: Boolean(dto.password),
            },
        });
        return updated;
    }
    async remove(restaurantId, actorId, id) {
        if (id === actorId) {
            throw new common_1.BadRequestException('You cannot delete your own account');
        }
        const existing = await this.prisma.user.findFirst({
            where: { id, restaurantId },
            include: { role: true },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Staff account not found');
        }
        if (existing.role.name === 'OWNER') {
            const otherActiveOwners = await this.prisma.user.count({
                where: {
                    restaurantId,
                    isActive: true,
                    id: { not: id },
                    role: { name: 'OWNER' },
                },
            });
            if (otherActiveOwners === 0) {
                throw new common_1.BadRequestException('Cannot delete the last active owner');
            }
        }
        try {
            await this.prisma.user.delete({ where: { id } });
        }
        catch (err) {
            if (err instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                err.code === 'P2003') {
                throw new common_1.BadRequestException('This staff account has order, purchase, or inventory history and cannot be deleted. Disable it instead.');
            }
            throw err;
        }
        await this.audit.record({
            userId: actorId,
            action: 'staff.deleted',
            entity: 'User',
            entityId: id,
            metadata: { name: existing.name, email: existing.email },
        });
        return { ok: true };
    }
    async assertRoleInRestaurant(restaurantId, roleId) {
        const role = await this.prisma.role.findFirst({
            where: { id: roleId, restaurantId },
        });
        if (!role) {
            throw new common_1.BadRequestException('Role not found for this restaurant');
        }
    }
    async assertBranchesInRestaurant(restaurantId, branchIds) {
        const count = await this.prisma.branch.count({
            where: { id: { in: branchIds }, restaurantId },
        });
        if (count !== branchIds.length) {
            throw new common_1.BadRequestException('One or more branches are invalid');
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], UsersService);
//# sourceMappingURL=users.service.js.map