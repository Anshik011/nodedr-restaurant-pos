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
exports.OperationsService = exports.ATTACHMENT_MAX_BYTES = void 0;
exports.nextDue = nextDue;
const common_1 = require("@nestjs/common");
const time_1 = require("../../common/time");
const branch_time_service_1 = require("../../common/services/branch-time.service");
const prisma_service_1 = require("../../prisma/prisma.service");
exports.ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024;
const ATTACHMENT_TYPES = new Set([
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'text/plain',
    'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);
const asDate = (d) => new Date(`${d}T00:00:00.000Z`);
function nextDue(lastServiced, intervalDays) {
    if (!lastServiced || !intervalDays)
        return null;
    return (0, time_1.addDaysToDate)(lastServiced, intervalDays);
}
let OperationsService = class OperationsService {
    prisma;
    time;
    constructor(prisma, time) {
        this.prisma = prisma;
        this.time = time;
    }
    async listEquipment(branchId) {
        const [rows, tz] = await Promise.all([
            this.prisma.equipment.findMany({
                where: { branchId, isActive: true },
                orderBy: [
                    { nextDueAt: { sort: 'asc', nulls: 'last' } },
                    { name: 'asc' },
                ],
            }),
            this.time.tzForBranch(branchId),
        ]);
        const today = (0, time_1.localDate)(new Date(), tz);
        return rows.map((e) => {
            const due = e.nextDueAt?.toISOString().slice(0, 10) ?? null;
            return {
                ...e,
                overdue: due != null && due < today,
                dueSoon: due != null && due >= today && due <= (0, time_1.addDaysToDate)(today, 7),
            };
        });
    }
    createEquipment(branchId, dto) {
        const due = nextDue(dto.lastServicedAt ?? null, dto.serviceIntervalDays);
        return this.prisma.equipment.create({
            data: {
                branchId,
                name: dto.name,
                location: dto.location,
                serviceIntervalDays: dto.serviceIntervalDays,
                lastServicedAt: dto.lastServicedAt ? asDate(dto.lastServicedAt) : null,
                nextDueAt: due ? asDate(due) : null,
                notes: dto.notes,
            },
        });
    }
    async retireEquipment(branchId, id) {
        await this.getEquipment(branchId, id);
        await this.prisma.equipment.update({
            where: { id },
            data: { isActive: false },
        });
        return { ok: true };
    }
    async logService(branchId, id, dto) {
        const eq = await this.getEquipment(branchId, id);
        const due = nextDue(dto.servicedAt, eq.serviceIntervalDays);
        const [log] = await this.prisma.$transaction([
            this.prisma.serviceLog.create({
                data: {
                    equipmentId: id,
                    servicedAt: asDate(dto.servicedAt),
                    cost: dto.cost,
                    note: dto.note,
                },
            }),
            this.prisma.equipment.update({
                where: { id },
                data: {
                    ...(!eq.lastServicedAt || asDate(dto.servicedAt) >= eq.lastServicedAt
                        ? {
                            lastServicedAt: asDate(dto.servicedAt),
                            nextDueAt: due ? asDate(due) : null,
                        }
                        : {}),
                },
            }),
        ]);
        return log;
    }
    async listLogs(branchId, id) {
        await this.getEquipment(branchId, id);
        return this.prisma.serviceLog.findMany({
            where: { equipmentId: id },
            orderBy: { servicedAt: 'desc' },
            take: 100,
        });
    }
    async getEquipment(branchId, id) {
        const eq = await this.prisma.equipment.findFirst({
            where: { id, branchId },
        });
        if (!eq)
            throw new common_1.NotFoundException('Equipment not found');
        return eq;
    }
    listDocuments(branchId, category) {
        return this.prisma.document.findMany({
            where: {
                branchId,
                ...(category &&
                    ['SOP', 'CONTRACT', 'RECIPE', 'PURCHASE', 'OTHER'].includes(category)
                    ? { category: category }
                    : {}),
            },
            select: { id: true, title: true, category: true, updatedAt: true },
            orderBy: { updatedAt: 'desc' },
            take: 200,
        });
    }
    async getDocument(branchId, id) {
        const d = await this.prisma.document.findFirst({
            where: { id, branchId },
            include: {
                files: {
                    select: {
                        id: true,
                        fileName: true,
                        mimeType: true,
                        size: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!d)
            throw new common_1.NotFoundException('Document not found');
        return d;
    }
    async addDocumentFile(branchId, id, file) {
        await this.getDocument(branchId, id);
        if (!ATTACHMENT_TYPES.has(file.mimetype))
            throw new common_1.BadRequestException('Attach a PDF, image, text, Word or Excel file');
        const count = await this.prisma.documentFile.count({
            where: { documentId: id },
        });
        if (count >= 10)
            throw new common_1.BadRequestException('A document can hold at most 10 files');
        const created = await this.prisma.documentFile.create({
            data: {
                documentId: id,
                fileName: file.originalname
                    .replace(/[\\/\u0000-\u001f"]/g, '_')
                    .slice(0, 150) || 'file',
                mimeType: file.mimetype,
                size: file.size,
                data: new Uint8Array(file.buffer),
            },
            select: {
                id: true,
                fileName: true,
                mimeType: true,
                size: true,
                createdAt: true,
            },
        });
        return created;
    }
    async getDocumentFile(branchId, id, fileId) {
        await this.getDocument(branchId, id);
        const f = await this.prisma.documentFile.findFirst({
            where: { id: fileId, documentId: id },
        });
        if (!f)
            throw new common_1.NotFoundException('File not found');
        return f;
    }
    async deleteDocumentFile(branchId, id, fileId) {
        await this.getDocumentFile(branchId, id, fileId);
        await this.prisma.documentFile.delete({ where: { id: fileId } });
        return { ok: true };
    }
    createDocument(branchId, dto) {
        return this.prisma.document.create({ data: { branchId, ...dto } });
    }
    async updateDocument(branchId, id, dto) {
        await this.getDocument(branchId, id);
        return this.prisma.document.update({ where: { id }, data: dto });
    }
    async deleteDocument(branchId, id) {
        await this.getDocument(branchId, id);
        await this.prisma.document.delete({ where: { id } });
        return { ok: true };
    }
};
exports.OperationsService = OperationsService;
exports.OperationsService = OperationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        branch_time_service_1.BranchTimeService])
], OperationsService);
//# sourceMappingURL=operations.service.js.map