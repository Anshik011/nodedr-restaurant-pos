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
exports.TablesService = void 0;
const node_crypto_1 = require("node:crypto");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const realtime_gateway_1 = require("../../realtime/realtime.gateway");
let TablesService = class TablesService {
    prisma;
    realtime;
    constructor(prisma, realtime) {
        this.prisma = prisma;
        this.realtime = realtime;
    }
    listFloors(branchId) {
        return this.prisma.floor.findMany({
            where: { branchId },
            orderBy: { sortOrder: 'asc' },
            include: {
                tables: {
                    include: { assignedWaiter: { select: { id: true, name: true } } },
                },
            },
        });
    }
    createFloor(branchId, dto) {
        return this.prisma.floor.create({ data: { ...dto, branchId } });
    }
    async updateFloor(branchId, id, dto) {
        await this.assertFloorInBranch(branchId, id);
        return this.prisma.floor.update({ where: { id }, data: dto });
    }
    async createTable(branchId, dto) {
        await this.assertFloorInBranch(branchId, dto.floorId);
        const table = await this.prisma.table.create({ data: dto });
        this.realtime.emitToBranch(branchId, 'table.updated', table);
        return table;
    }
    async createTables(branchId, dto) {
        await this.assertFloorInBranch(branchId, dto.floorId);
        const numbers = dto.numbers.map((n) => n.trim()).filter(Boolean);
        const duplicatesInBatch = numbers.filter((n, i) => numbers.indexOf(n) !== i);
        if (duplicatesInBatch.length > 0) {
            throw new common_1.BadRequestException(`Table numbers must be unique: ${[...new Set(duplicatesInBatch)].join(', ')} ${duplicatesInBatch.length > 1 ? 'are' : 'is'} repeated.`);
        }
        const existing = await this.prisma.table.findMany({
            where: { floorId: dto.floorId, number: { in: numbers } },
            select: { number: true },
        });
        if (existing.length > 0) {
            const clashes = existing.map((t) => t.number).join(', ');
            throw new common_1.BadRequestException(`These table numbers already exist on this floor: ${clashes}. Choose different numbers.`);
        }
        const tables = await this.prisma.$transaction(numbers.map((number, index) => this.prisma.table.create({
            data: {
                floorId: dto.floorId,
                number,
                capacity: dto.capacity,
                shape: dto.shape,
                color: dto.color,
                posX: 20 + (index % 5) * 100,
                posY: 20 + Math.floor(index / 5) * 100,
            },
        })));
        tables.forEach((table) => this.realtime.emitToBranch(branchId, 'table.updated', table));
        return tables;
    }
    async updateTable(branchId, id, dto) {
        await this.assertTableInBranch(branchId, id);
        const table = await this.prisma.table.update({ where: { id }, data: dto });
        this.realtime.emitToBranch(branchId, 'table.updated', table);
        return table;
    }
    async updateTableLayout(branchId, updates) {
        const owned = await this.prisma.table.findMany({
            where: { id: { in: updates.map((u) => u.id) }, floor: { branchId } },
            select: { id: true },
        });
        if (owned.length !== updates.length) {
            throw new common_1.BadRequestException('One or more tables are invalid for this branch');
        }
        const results = await this.prisma.$transaction(updates.map(({ id, ...rest }) => this.prisma.table.update({ where: { id }, data: rest })));
        this.realtime.emitToBranch(branchId, 'table.layout.updated', results);
        return results;
    }
    async updateTableStatus(branchId, id, status, assignedWaiterId) {
        await this.assertTableInBranch(branchId, id);
        if (status !== 'OCCUPIED') {
            const open = await this.prisma.order.findFirst({
                where: { tableId: id, status: 'OPEN' },
                select: { orderNumber: true },
            });
            if (open) {
                throw new common_1.ConflictException(`This table has an open bill (#${open.orderNumber}) - pay or cancel it first`);
            }
        }
        const table = await this.prisma.table.update({
            where: { id },
            data: {
                status,
                statusSince: new Date(),
                ...(assignedWaiterId ? { assignedWaiterId } : {}),
            },
        });
        this.realtime.emitToBranch(branchId, 'table.updated', table);
        return table;
    }
    async deleteTable(branchId, id) {
        await this.assertTableInBranch(branchId, id);
        await this.prisma.table.delete({ where: { id } });
        this.realtime.emitToBranch(branchId, 'table.deleted', { id });
        return { ok: true };
    }
    async rotateQrToken(branchId, id) {
        const table = await this.prisma.table.findFirst({
            where: { id, floor: { branchId } },
        });
        if (!table)
            throw new common_1.NotFoundException('Table not found');
        const qrToken = (0, node_crypto_1.randomBytes)(16).toString('hex');
        return this.prisma.table.update({ where: { id }, data: { qrToken } });
    }
    async assertFloorInBranch(branchId, floorId) {
        const floor = await this.prisma.floor.findFirst({
            where: { id: floorId, branchId },
        });
        if (!floor)
            throw new common_1.NotFoundException('Floor not found');
    }
    async assertTableInBranch(branchId, tableId) {
        const table = await this.prisma.table.findFirst({
            where: { id: tableId, floor: { branchId } },
        });
        if (!table)
            throw new common_1.NotFoundException('Table not found');
    }
    listOpenRequests(branchId) {
        return this.prisma.tableRequest.findMany({
            where: { branchId, resolvedAt: null },
            include: { table: { select: { id: true, number: true, name: true } } },
            orderBy: { createdAt: 'asc' },
        });
    }
    async resolveRequest(branchId, id) {
        const request = await this.prisma.tableRequest.findFirst({
            where: { id, branchId },
        });
        if (!request)
            throw new common_1.NotFoundException('Request not found');
        const updated = await this.prisma.tableRequest.update({
            where: { id },
            data: { resolvedAt: new Date() },
        });
        this.realtime.emitToBranch(branchId, 'table.request', { id });
        return updated;
    }
};
exports.TablesService = TablesService;
exports.TablesService = TablesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        realtime_gateway_1.RealtimeGateway])
], TablesService);
//# sourceMappingURL=tables.service.js.map