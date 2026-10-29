import type { Response } from 'express';
import { type DocumentDto, type EquipmentDto, type ServiceLogDto, type SessionUser } from '@nodedr-restaurant/types';
import { BranchAccessService } from '../../common/services/branch-access.service';
import { OperationsService } from './operations.service';
export declare class OperationsController {
    private readonly ops;
    private readonly branchAccess;
    constructor(ops: OperationsService, branchAccess: BranchAccessService);
    private access;
    equipment(u: SessionUser, branchId: string): Promise<{
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
    createEquipment(u: SessionUser, branchId: string, body: EquipmentDto): Promise<{
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
    }>;
    retire(u: SessionUser, branchId: string, id: string): Promise<{
        ok: boolean;
    }>;
    logs(u: SessionUser, branchId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        note: string | null;
        cost: import("@prisma/client/runtime/library").Decimal | null;
        servicedAt: Date;
        equipmentId: string;
    }[]>;
    logService(u: SessionUser, branchId: string, id: string, body: ServiceLogDto): Promise<{
        id: string;
        createdAt: Date;
        note: string | null;
        cost: import("@prisma/client/runtime/library").Decimal | null;
        servicedAt: Date;
        equipmentId: string;
    }>;
    documents(u: SessionUser, branchId: string, category?: string): Promise<{
        id: string;
        category: import("@prisma/client").$Enums.DocumentCategory;
        updatedAt: Date;
        title: string;
    }[]>;
    document(u: SessionUser, branchId: string, id: string): Promise<{
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
    createDocument(u: SessionUser, branchId: string, body: DocumentDto): Promise<{
        id: string;
        category: import("@prisma/client").$Enums.DocumentCategory;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        body: string;
        title: string;
    }>;
    updateDocument(u: SessionUser, branchId: string, id: string, body: Partial<DocumentDto>): Promise<{
        id: string;
        category: import("@prisma/client").$Enums.DocumentCategory;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        body: string;
        title: string;
    }>;
    deleteDocument(u: SessionUser, branchId: string, id: string): Promise<{
        ok: boolean;
    }>;
    attach(u: SessionUser, branchId: string, id: string, file?: Express.Multer.File): Promise<{
        id: string;
        createdAt: Date;
        size: number;
        fileName: string;
        mimeType: string;
    }>;
    download(u: SessionUser, branchId: string, id: string, fileId: string, res: Response): Promise<void>;
    removeFile(u: SessionUser, branchId: string, id: string, fileId: string): Promise<{
        ok: boolean;
    }>;
}
