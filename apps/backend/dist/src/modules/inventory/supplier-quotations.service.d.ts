import type { QuotationStatus, SupplierQuotationDto } from '@nodedr-restaurant/types';
import { PrismaService } from '../../prisma/prisma.service';
export declare class SupplierQuotationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listQuotations(branchId: string, ingredientId?: string): import("@prisma/client").Prisma.PrismaPromise<({
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
            ingredientId: string;
            supplierQuotationId: string;
            quantityQuoted: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        })[];
        supplier: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.QuotationStatus;
        notes: string | null;
        createdById: string;
        supplierId: string;
        validUntil: Date | null;
        quotationNumber: string;
    })[]>;
    getQuotation(branchId: string, id: string): Promise<{
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
            ingredientId: string;
            supplierQuotationId: string;
            quantityQuoted: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        })[];
        createdBy: {
            id: string;
            name: string;
        };
        supplier: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            phone: string | null;
            gstNumber: string | null;
            isActive: boolean;
            email: string | null;
            branchId: string;
            notes: string | null;
            contactName: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.QuotationStatus;
        notes: string | null;
        createdById: string;
        supplierId: string;
        validUntil: Date | null;
        quotationNumber: string;
    }>;
    compareForIngredient(branchId: string, ingredientId: string): Promise<{
        supplierId: string;
        supplierName: string;
        quotationId: string;
        quotationNumber: string;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
        quantityQuoted: import("@prisma/client/runtime/library").Decimal;
        validUntil: Date | null;
    }[]>;
    createQuotation(branchId: string, userId: string, dto: SupplierQuotationDto): Promise<{
        items: {
            id: string;
            ingredientId: string;
            supplierQuotationId: string;
            quantityQuoted: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.QuotationStatus;
        notes: string | null;
        createdById: string;
        supplierId: string;
        validUntil: Date | null;
        quotationNumber: string;
    }>;
    updateStatus(branchId: string, id: string, status: QuotationStatus): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.QuotationStatus;
        notes: string | null;
        createdById: string;
        supplierId: string;
        validUntil: Date | null;
        quotationNumber: string;
    }>;
    private nextQuotationNumber;
}
