import { PrismaService } from '../../prisma/prisma.service';
import { StockService } from './stock.service';
export declare class TransfersService {
    private readonly prisma;
    private readonly stock;
    constructor(prisma: PrismaService, stock: StockService);
    list(restaurantId: string, branchId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        restaurantId: string;
        createdById: string;
        quantity: import("@prisma/client/runtime/library").Decimal;
        note: string | null;
        unit: string;
        unitCost: import("@prisma/client/runtime/library").Decimal;
        fromBranchId: string;
        toBranchId: string;
        fromBranchName: string;
        toBranchName: string;
        ingredientName: string;
    }[]>;
    otherBranches(restaurantId: string, branchId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
    }[]>;
    transfer(restaurantId: string, userId: string, fromBranchId: string, dto: {
        toBranchId: string;
        ingredientId: string;
        quantity: number;
        note?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        restaurantId: string;
        createdById: string;
        quantity: import("@prisma/client/runtime/library").Decimal;
        note: string | null;
        unit: string;
        unitCost: import("@prisma/client/runtime/library").Decimal;
        fromBranchId: string;
        toBranchId: string;
        fromBranchName: string;
        toBranchName: string;
        ingredientName: string;
    }>;
}
