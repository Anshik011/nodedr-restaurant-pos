import type { Prisma } from '@prisma/client';
import type { GoodsReceiptDto } from '@nodedr-restaurant/types';
import { PrismaService } from '../../prisma/prisma.service';
export declare class GoodsReceiptsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listGoodsReceipts(branchId: string): Prisma.PrismaPromise<({
        items: {
            id: string;
            createdAt: Date;
            quantity: Prisma.Decimal;
            goodsReceiptId: string;
            ingredientId: string;
            unitCost: Prisma.Decimal;
            purchaseOrderItemId: string | null;
            batchNumber: string;
            expiryDate: Date | null;
        }[];
        supplier: {
            id: string;
            name: string;
        };
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
    })[]>;
    getGoodsReceipt(branchId: string, id: string): Promise<{
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
                reorderLevel: Prisma.Decimal;
                currentStock: Prisma.Decimal;
                costPerUnit: Prisma.Decimal;
            };
            stockBatch: {
                id: string;
                branchId: string;
                ingredientId: string;
                receivedAt: Date;
                unitCost: Prisma.Decimal;
                quantityReceived: Prisma.Decimal;
                batchNumber: string;
                expiryDate: Date | null;
                quantityRemaining: Prisma.Decimal;
                goodsReceiptItemId: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            quantity: Prisma.Decimal;
            goodsReceiptId: string;
            ingredientId: string;
            unitCost: Prisma.Decimal;
            purchaseOrderItemId: string | null;
            batchNumber: string;
            expiryDate: Date | null;
        })[];
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
        purchaseOrder: {
            id: string;
            poNumber: string;
        } | null;
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
    }>;
    createGoodsReceipt(branchId: string, userId: string, dto: GoodsReceiptDto): Promise<{
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
                reorderLevel: Prisma.Decimal;
                currentStock: Prisma.Decimal;
                costPerUnit: Prisma.Decimal;
            };
            stockBatch: {
                id: string;
                branchId: string;
                ingredientId: string;
                receivedAt: Date;
                unitCost: Prisma.Decimal;
                quantityReceived: Prisma.Decimal;
                batchNumber: string;
                expiryDate: Date | null;
                quantityRemaining: Prisma.Decimal;
                goodsReceiptItemId: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            quantity: Prisma.Decimal;
            goodsReceiptId: string;
            ingredientId: string;
            unitCost: Prisma.Decimal;
            purchaseOrderItemId: string | null;
            batchNumber: string;
            expiryDate: Date | null;
        })[];
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
    }>;
    private nextGrnNumber;
}
