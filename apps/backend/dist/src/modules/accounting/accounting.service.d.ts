import type { CashClosingDto, ExpenseDto } from '@nodedr-restaurant/types';
import { BranchTimeService } from '../../common/services/branch-time.service';
import { PrismaService } from '../../prisma/prisma.service';
export declare class AccountingService {
    private readonly prisma;
    private readonly time;
    constructor(prisma: PrismaService, time: BranchTimeService);
    listExpenses(branchId: string, from: string, to: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        category: string;
        createdAt: Date;
        branchId: string;
        createdById: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        note: string | null;
        spentOn: Date;
        paidFromCash: boolean;
    }[]>;
    createExpense(branchId: string, userId: string, dto: ExpenseDto): import("@prisma/client").Prisma.Prisma__ExpenseClient<{
        id: string;
        category: string;
        createdAt: Date;
        branchId: string;
        createdById: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        note: string | null;
        spentOn: Date;
        paidFromCash: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    deleteExpense(branchId: string, id: string): Promise<{
        ok: boolean;
    }>;
    closingPreview(branchId: string, date: string, openingFloat?: number): Promise<{
        businessDate: string;
        openingFloat: number;
        cashSales: number;
        cashExpenses: number;
        expectedCash: number;
    }>;
    closeDay(branchId: string, userId: string, dto: CashClosingDto): Promise<{
        id: string;
        createdAt: Date;
        branchId: string;
        note: string | null;
        businessDate: Date;
        openingFloat: import("@prisma/client/runtime/library").Decimal;
        cashSales: import("@prisma/client/runtime/library").Decimal;
        cashExpenses: import("@prisma/client/runtime/library").Decimal;
        expectedCash: import("@prisma/client/runtime/library").Decimal;
        countedCash: import("@prisma/client/runtime/library").Decimal;
        variance: import("@prisma/client/runtime/library").Decimal;
        closedById: string;
    }>;
    listClosings(branchId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        branchId: string;
        note: string | null;
        businessDate: Date;
        openingFloat: import("@prisma/client/runtime/library").Decimal;
        cashSales: import("@prisma/client/runtime/library").Decimal;
        cashExpenses: import("@prisma/client/runtime/library").Decimal;
        expectedCash: import("@prisma/client/runtime/library").Decimal;
        countedCash: import("@prisma/client/runtime/library").Decimal;
        variance: import("@prisma/client/runtime/library").Decimal;
        closedById: string;
    }[]>;
    profitAndLoss(branchId: string, from: string, to: string): Promise<{
        from: string;
        to: string;
        orders: number;
        grossCollected: number;
        taxCollected: number;
        refunds: number;
        netSales: number;
        expenses: {
            category: string;
            amount: number;
        }[];
        totalExpenses: number;
        payrollCost: number;
        netProfit: number;
    }>;
    gstReport(branchId: string, from: string, to: string): Promise<{
        rows: import("./accounting.calc").GstRow[];
        totalTaxable: number;
        totalTax: number;
        from: string;
        to: string;
        orders: number;
    }>;
    branchOverview(restaurantId: string, from: string, to: string): Promise<{
        branchId: string;
        name: string;
        orders: number;
        sales: number;
        openOrders: number;
        lowStockItems: number;
        inventoryValue: number;
    }[]>;
}
