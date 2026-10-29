import type { WasteLogDto } from '@nodedr-restaurant/types';
import { PrismaService } from '../../prisma/prisma.service';
import { StockService } from './stock.service';
export declare class WasteService {
    private readonly prisma;
    private readonly stockService;
    constructor(prisma: PrismaService, stockService: StockService);
    listWasteLogs(branchId: string): import("@prisma/client").Prisma.PrismaPromise<({
        createdBy: {
            id: string;
            name: string;
        };
        ingredient: {
            id: string;
            name: string;
            unit: import("@prisma/client").$Enums.IngredientUnit;
        };
    } & {
        id: string;
        createdAt: Date;
        branchId: string;
        notes: string | null;
        createdById: string;
        quantity: import("@prisma/client/runtime/library").Decimal;
        reason: import("@prisma/client").$Enums.WasteReason;
        ingredientId: string;
        batchId: string | null;
        unitCostAtWaste: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    logWaste(branchId: string, userId: string, dto: WasteLogDto): Promise<{
        id: string;
        createdAt: Date;
        branchId: string;
        notes: string | null;
        createdById: string;
        quantity: import("@prisma/client/runtime/library").Decimal;
        reason: import("@prisma/client").$Enums.WasteReason;
        ingredientId: string;
        batchId: string | null;
        unitCostAtWaste: import("@prisma/client/runtime/library").Decimal;
    }[]>;
}
