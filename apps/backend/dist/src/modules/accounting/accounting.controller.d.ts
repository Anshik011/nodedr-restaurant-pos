import { type CashClosingDto, type ExpenseDto, type SessionUser } from '@nodedr-restaurant/types';
import { BranchAccessService } from '../../common/services/branch-access.service';
import { AccountingService } from './accounting.service';
export declare class AccountingController {
    private readonly accounting;
    private readonly branchAccess;
    constructor(accounting: AccountingService, branchAccess: BranchAccessService);
    private access;
    expenses(u: SessionUser, branchId: string, from: string, to: string): Promise<{
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
    createExpense(u: SessionUser, branchId: string, body: ExpenseDto): Promise<{
        id: string;
        category: string;
        createdAt: Date;
        branchId: string;
        createdById: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        note: string | null;
        spentOn: Date;
        paidFromCash: boolean;
    }>;
    deleteExpense(u: SessionUser, branchId: string, id: string): Promise<{
        ok: boolean;
    }>;
    preview(u: SessionUser, branchId: string, date: string, openingFloat?: string): Promise<{
        businessDate: string;
        openingFloat: number;
        cashSales: number;
        cashExpenses: number;
        expectedCash: number;
    }>;
    closings(u: SessionUser, branchId: string): Promise<{
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
    close(u: SessionUser, branchId: string, body: CashClosingDto): Promise<{
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
    pnl(u: SessionUser, branchId: string, from: string, to: string): Promise<{
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
    gst(u: SessionUser, branchId: string, from: string, to: string): Promise<{
        rows: import("./accounting.calc").GstRow[];
        totalTaxable: number;
        totalTax: number;
        from: string;
        to: string;
        orders: number;
    }>;
    branches(u: SessionUser, from: string, to: string): Promise<{
        branchId: string;
        name: string;
        orders: number;
        sales: number;
        openOrders: number;
        lowStockItems: number;
        inventoryValue: number;
    }[]>;
}
