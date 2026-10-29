import type { DocumentDto, EquipmentDto, ServiceLogDto } from '@nodedr-restaurant/types';
import { BranchTimeService } from '../../common/services/branch-time.service';
import { PrismaService } from '../../prisma/prisma.service';
export declare const ATTACHMENT_MAX_BYTES: number;
export declare function nextDue(lastServiced: string | null, intervalDays: number | null | undefined): string | null;
export declare class OperationsService {
    private readonly prisma;
    private readonly time;
    constructor(prisma: PrismaService, time: BranchTimeService);
    listEquipment(branchId: string): Promise<{
        overdue: boolean;
        dueSoon: boolean;
        id: string;
        name: string;
        createdAt: Date;
        isActive: boolean;
        branchId: string;
        notes: string | null;
        location: string | null;
        serviceIntervalDays: number | null;
        lastServicedAt: Date | null;
        nextDueAt: Date | null;
    }[]>;
    createEquipment(branchId: string, dto: EquipmentDto): import("@prisma/client").Prisma.Prisma__EquipmentClient<{
        id: string;
        name: string;
        createdAt: Date;
        isActive: boolean;
        branchId: string;
        notes: string | null;
        location: string | null;
        serviceIntervalDays: number | null;
        lastServicedAt: Date | null;
        nextDueAt: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    retireEquipment(branchId: string, id: string): Promise<{
        ok: boolean;
    }>;
    logService(branchId: string, id: string, dto: ServiceLogDto): Promise<{
        id: string;
        createdAt: Date;
        note: string | null;
        cost: import("@prisma/client/runtime/library").Decimal | null;
        servicedAt: Date;
        equipmentId: string;
    }>;
    listLogs(branchId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        note: string | null;
        cost: import("@prisma/client/runtime/library").Decimal | null;
        servicedAt: Date;
        equipmentId: string;
    }[]>;
    private getEquipment;
    listDocuments(branchId: string, category?: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        category: import("@prisma/client").$Enums.DocumentCategory;
        updatedAt: Date;
        title: string;
    }[]>;
    getDocument(branchId: string, id: string): Promise<{
        files: {
            id: string;
            createdAt: Date;
            size: number;
            fileName: string;
            mimeType: string;
        }[];
    } & {
        id: string;
        category: import("@prisma/client").$Enums.DocumentCategory;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        body: string;
        title: string;
    }>;
    addDocumentFile(branchId: string, id: string, file: {
        originalname: string;
        mimetype: string;
        size: number;
        buffer: Buffer;
    }): Promise<{
        id: string;
        createdAt: Date;
        size: number;
        fileName: string;
        mimeType: string;
    }>;
    getDocumentFile(branchId: string, id: string, fileId: string): Promise<{
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").Bytes;
        size: number;
        documentId: string;
        fileName: string;
        mimeType: string;
    }>;
    deleteDocumentFile(branchId: string, id: string, fileId: string): Promise<{
        ok: boolean;
    }>;
    createDocument(branchId: string, dto: DocumentDto): import("@prisma/client").Prisma.Prisma__DocumentClient<{
        id: string;
        category: import("@prisma/client").$Enums.DocumentCategory;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        body: string;
        title: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateDocument(branchId: string, id: string, dto: Partial<DocumentDto>): Promise<{
        id: string;
        category: import("@prisma/client").$Enums.DocumentCategory;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        body: string;
        title: string;
    }>;
    deleteDocument(branchId: string, id: string): Promise<{
        ok: boolean;
    }>;
}
