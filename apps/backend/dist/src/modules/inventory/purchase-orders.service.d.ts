import type { PurchaseOrderDto, PurchaseOrderStatus } from '@nodedr-restaurant/types';
import { PrismaService } from '../../prisma/prisma.service';
export declare class PurchaseOrdersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listPurchaseOrders(branchId: string, status?: PurchaseOrderStatus): import("@prisma/client").Prisma.PrismaPromise<({
        items: {
            id: string;
            purchaseOrderId: string;
            ingredientId: string;
            quantityOrdered: import("@prisma/client/runtime/library").Decimal;
            unitCost: import("@prisma/client/runtime/library").Decimal;
            quantityReceived: import("@prisma/client/runtime/library").Decimal;
        }[];
        createdBy: {
            id: string;
            name: string;
        };
        supplier: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.PurchaseOrderStatus;
        notes: string | null;
        createdById: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        supplierId: string;
        poNumber: string;
        expectedDate: Date | null;
    })[]>;
    getPurchaseOrder(branchId: string, id: string): Promise<{
        goodsReceipts: ({
            items: {
                id: string;
                createdAt: Date;
                quantity: import("@prisma/client/runtime/library").Decimal;
                goodsReceiptId: string;
                ingredientId: string;
                unitCost: import("@prisma/client/runtime/library").Decimal;
                purchaseOrderItemId: string | null;
                batchNumber: string;
                expiryDate: Date | null;
            }[];
            receivedBy: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            branchId: string;
            notes: string | null;
            supplierId: string;
            purchaseOrderId: string | null;
            grnNumber: string;
            receivedById: string;
            receivedAt: Date;
        })[];
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
            purchaseOrderId: string;
            ingredientId: string;
            quantityOrdered: import("@prisma/client/runtime/library").Decimal;
            unitCost: import("@prisma/client/runtime/library").Decimal;
            quantityReceived: import("@prisma/client/runtime/library").Decimal;
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
        status: import("@prisma/client").$Enums.PurchaseOrderStatus;
        notes: string | null;
        createdById: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        supplierId: string;
        poNumber: string;
        expectedDate: Date | null;
    }>;
    createPurchaseOrder(branchId: string, userId: string, dto: PurchaseOrderDto): Promise<{
        items: {
            id: string;
            purchaseOrderId: string;
            ingredientId: string;
            quantityOrdered: import("@prisma/client/runtime/library").Decimal;
            unitCost: import("@prisma/client/runtime/library").Decimal;
            quantityReceived: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.PurchaseOrderStatus;
        notes: string | null;
        createdById: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        supplierId: string;
        poNumber: string;
        expectedDate: Date | null;
    }>;
    updateStatus(branchId: string, id: string, status: PurchaseOrderStatus): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.PurchaseOrderStatus;
        notes: string | null;
        createdById: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        supplierId: string;
        poNumber: string;
        expectedDate: Date | null;
    }>;
    private nextPoNumber;
}
