import type { PurchaseRequestDto, PurchaseRequestStatus } from '@nodedr-restaurant/types';
import { PrismaService } from '../../prisma/prisma.service';
export declare class PurchaseRequestsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listPurchaseRequests(branchId: string, status?: PurchaseRequestStatus): import("@prisma/client").Prisma.PrismaPromise<({
        items: ({
            ingredient: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                branchId: string;
                sku: string | null;
                unit: import("@prisma/client").$Enums.IngredientUnit;
                reorderLevel: import("@prisma/client/runtime/library").Decimal;
                currentStock: import("@prisma/client/runtime/library").Decimal;
                costPerUnit: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: string;
            notes: string | null;
            ingredientId: string;
            quantityRequested: import("@prisma/client/runtime/library").Decimal;
            purchaseRequestId: string;
        })[];
        requestedBy: {
            id: string;
            name: string;
        };
        approvedBy: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.PurchaseRequestStatus;
        notes: string | null;
        requestNumber: string;
        requestedById: string;
        approvedById: string | null;
    })[]>;
    getPurchaseRequest(branchId: string, id: string): Promise<{
        items: ({
            ingredient: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                branchId: string;
                sku: string | null;
                unit: import("@prisma/client").$Enums.IngredientUnit;
                reorderLevel: import("@prisma/client/runtime/library").Decimal;
                currentStock: import("@prisma/client/runtime/library").Decimal;
                costPerUnit: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: string;
            notes: string | null;
            ingredientId: string;
            quantityRequested: import("@prisma/client/runtime/library").Decimal;
            purchaseRequestId: string;
        })[];
        requestedBy: {
            id: string;
            name: string;
        };
        approvedBy: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.PurchaseRequestStatus;
        notes: string | null;
        requestNumber: string;
        requestedById: string;
        approvedById: string | null;
    }>;
    createPurchaseRequest(branchId: string, userId: string, dto: PurchaseRequestDto): Promise<{
        items: {
            id: string;
            notes: string | null;
            ingredientId: string;
            quantityRequested: import("@prisma/client/runtime/library").Decimal;
            purchaseRequestId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.PurchaseRequestStatus;
        notes: string | null;
        requestNumber: string;
        requestedById: string;
        approvedById: string | null;
    }>;
    updateStatus(branchId: string, id: string, userId: string, status: PurchaseRequestStatus): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.PurchaseRequestStatus;
        notes: string | null;
        requestNumber: string;
        requestedById: string;
        approvedById: string | null;
    }>;
    private nextRequestNumber;
}
