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
exports.MenuService = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("../../audit/audit.service");
const prisma_service_1 = require("../../prisma/prisma.service");
let MenuService = class MenuService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    listCategories(branchId) {
        return this.prisma.menuCategory.findMany({
            where: { branchId },
            orderBy: { sortOrder: 'asc' },
            include: { _count: { select: { items: true } } },
        });
    }
    createCategory(branchId, dto) {
        return this.prisma.menuCategory.create({ data: { ...dto, branchId } });
    }
    async updateCategory(branchId, id, dto) {
        await this.assertCategoryInBranch(branchId, id);
        return this.prisma.menuCategory.update({ where: { id }, data: dto });
    }
    async deleteCategory(branchId, id) {
        await this.assertCategoryInBranch(branchId, id);
        await this.prisma.menuCategory.delete({ where: { id } });
        return { ok: true };
    }
    async assertCategoryInBranch(branchId, id) {
        const category = await this.prisma.menuCategory.findFirst({
            where: { id, branchId },
        });
        if (!category)
            throw new common_1.NotFoundException('Category not found');
    }
    listStations(branchId) {
        return this.prisma.kitchenStation.findMany({ where: { branchId } });
    }
    createStation(branchId, name, printerName) {
        return this.prisma.kitchenStation.create({
            data: { branchId, name, printerName },
        });
    }
    listItems(branchId, categoryId) {
        return this.prisma.menuItem.findMany({
            where: { branchId, ...(categoryId ? { categoryId } : {}) },
            orderBy: { sortOrder: 'asc' },
            include: {
                category: true,
                station: true,
                modifierGroups: {
                    include: { modifierGroup: { include: { modifiers: true } } },
                },
            },
        });
    }
    async getItem(branchId, id) {
        const item = await this.prisma.menuItem.findFirst({
            where: { id, branchId },
            include: {
                modifierGroups: {
                    include: { modifierGroup: { include: { modifiers: true } } },
                },
            },
        });
        if (!item)
            throw new common_1.NotFoundException('Menu item not found');
        return item;
    }
    async createItem(branchId, dto) {
        const { modifierGroupIds, ...rest } = dto;
        await this.assertModifierGroupsInBranch(branchId, modifierGroupIds);
        return this.prisma.menuItem.create({
            data: {
                ...rest,
                branchId,
                modifierGroups: {
                    create: modifierGroupIds.map((modifierGroupId, index) => ({
                        modifierGroupId,
                        sortOrder: index,
                    })),
                },
            },
            include: { modifierGroups: { include: { modifierGroup: true } } },
        });
    }
    async updateItem(branchId, id, userId, dto) {
        const existing = await this.getItem(branchId, id);
        const { modifierGroupIds, ...rest } = dto;
        if (modifierGroupIds) {
            await this.assertModifierGroupsInBranch(branchId, modifierGroupIds);
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            if (modifierGroupIds) {
                await tx.menuItemModifierGroup.deleteMany({
                    where: { menuItemId: id },
                });
                await tx.menuItemModifierGroup.createMany({
                    data: modifierGroupIds.map((modifierGroupId, index) => ({
                        menuItemId: id,
                        modifierGroupId,
                        sortOrder: index,
                    })),
                });
            }
            return tx.menuItem.update({ where: { id }, data: rest });
        });
        await this.audit.record({
            userId,
            action: 'menu_item.updated',
            entity: 'MenuItem',
            entityId: id,
            metadata: {
                name: updated.name,
                priceBefore: Number(existing.price),
                priceAfter: Number(updated.price),
                changes: rest,
            },
        });
        return updated;
    }
    async assertModifierGroupsInBranch(branchId, modifierGroupIds) {
        if (modifierGroupIds.length === 0)
            return;
        const count = await this.prisma.modifierGroup.count({
            where: { id: { in: modifierGroupIds }, branchId },
        });
        if (count !== new Set(modifierGroupIds).size) {
            throw new common_1.BadRequestException('One or more modifier groups are invalid for this branch');
        }
    }
    async deleteItem(branchId, id) {
        await this.getItem(branchId, id);
        await this.prisma.menuItem.delete({ where: { id } });
        return { ok: true };
    }
    listModifierGroups(branchId) {
        return this.prisma.modifierGroup.findMany({
            where: { branchId },
            include: { modifiers: true },
        });
    }
    createModifierGroup(branchId, dto) {
        const { modifiers, ...rest } = dto;
        return this.prisma.modifierGroup.create({
            data: { ...rest, branchId, modifiers: { create: modifiers } },
            include: { modifiers: true },
        });
    }
    async updateModifierGroup(branchId, id, dto) {
        await this.assertModifierGroupInBranch(branchId, id);
        const { modifiers, ...rest } = dto;
        return this.prisma.$transaction(async (tx) => {
            if (modifiers) {
                await tx.modifier.deleteMany({ where: { groupId: id } });
                await tx.modifier.createMany({
                    data: modifiers.map((m) => ({ ...m, groupId: id })),
                });
            }
            return tx.modifierGroup.update({
                where: { id },
                data: rest,
                include: { modifiers: true },
            });
        });
    }
    async deleteModifierGroup(branchId, id) {
        await this.assertModifierGroupInBranch(branchId, id);
        await this.prisma.modifierGroup.delete({ where: { id } });
        return { ok: true };
    }
    async assertModifierGroupInBranch(branchId, id) {
        const group = await this.prisma.modifierGroup.findFirst({
            where: { id, branchId },
        });
        if (!group)
            throw new common_1.NotFoundException('Modifier group not found');
    }
    async setComboComponents(branchId, comboItemId, components) {
        await this.getItem(branchId, comboItemId);
        if (components.some((c) => c.componentItemId === comboItemId)) {
            throw new common_1.BadRequestException('A combo cannot include itself as a component');
        }
        const componentIds = components.map((c) => c.componentItemId);
        if (componentIds.length > 0) {
            const count = await this.prisma.menuItem.count({
                where: { id: { in: componentIds }, branchId },
            });
            if (count !== new Set(componentIds).size) {
                throw new common_1.BadRequestException('One or more combo components are invalid for this branch');
            }
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.comboComponent.deleteMany({ where: { comboItemId } });
            if (components.length > 0) {
                await tx.comboComponent.createMany({
                    data: components.map((c) => ({ comboItemId, ...c })),
                });
            }
            await tx.menuItem.update({
                where: { id: comboItemId },
                data: { isCombo: components.length > 0 },
            });
            return tx.comboComponent.findMany({
                where: { comboItemId },
                include: {
                    componentItem: { select: { id: true, name: true, price: true } },
                },
            });
        });
    }
    async getComboComponents(branchId, comboItemId) {
        await this.getItem(branchId, comboItemId);
        return this.prisma.comboComponent.findMany({
            where: { comboItemId },
            include: {
                componentItem: { select: { id: true, name: true, price: true } },
            },
        });
    }
};
exports.MenuService = MenuService;
exports.MenuService = MenuService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], MenuService);
//# sourceMappingURL=menu.service.js.map