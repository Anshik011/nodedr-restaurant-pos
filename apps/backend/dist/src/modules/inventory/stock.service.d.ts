import type { Prisma, StockMovementType } from '@prisma/client';
import type { StockAdjustmentDto } from '@nodedr-restaurant/types';
import { PrismaService } from '../../prisma/prisma.service';
type Tx = Prisma.TransactionClient;
export interface StockConsumptionPortion {
    batchId: string | null;
    quantity: number;
    unitCost: number;
}
export declare class StockService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listMovements(branchId: string, ingredientId: string): Prisma.PrismaPromise<({
        createdBy: {
            id: string;
            name: string;
        };
        batch: {
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
        branchId: string;
        type: import("@prisma/client").$Enums.StockMovementType;
        createdById: string;
        orderId: string | null;
        quantity: Prisma.Decimal;
        note: string | null;
        ingredientId: string;
        batchId: string | null;
    })[]>;
    listBatches(branchId: string, ingredientId: string): Prisma.PrismaPromise<{
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
    }[]>;
    consumeStock(tx: Tx, branchId: string, ingredientId: string, quantity: number, opts: {
        type: StockMovementType;
        note?: string;
        userId: string;
        allowNegative?: boolean;
        orderId?: string;
    }): Promise<StockConsumptionPortion[]>;
    restoreStock(tx: Tx, branchId: string, ingredientId: string, quantity: number, opts: {
        userId: string;
        orderId: string;
        note?: string;
    }): Promise<number>;
    adjustStock(branchId: string, userId: string, ingredientId: string, dto: StockAdjustmentDto): Promise<{
        id: string;
        createdAt: Date;
        branchId: string;
        type: import("@prisma/client").$Enums.StockMovementType;
        createdById: string;
        orderId: string | null;
        quantity: Prisma.Decimal;
        note: string | null;
        ingredientId: string;
        batchId: string | null;
    }>;
}
export {};
