import { PrismaService } from '../../prisma/prisma.service';
export declare function parseCsvLine(line: string): string[];
export declare function parseStatement(csv: string): {
    rows: {
        postedOn: string;
        description: string;
        reference: string;
        amount: number;
    }[];
    skipped: number[];
};
export declare class LedgerService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    setBudget(branchId: string, dto: {
        month: string;
        category: string;
        amount: number;
    }): Promise<{
        id: string;
        category: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        month: string;
    }>;
    deleteBudget(branchId: string, id: string): Promise<{
        ok: boolean;
    }>;
    budgetVsActual(branchId: string, month: string): Promise<{
        month: string;
        rows: {
            id: string;
            category: string;
            budget: number;
            actual: number;
            remaining: number;
            percentUsed: number;
        }[];
        unbudgeted: {
            category: string;
            actual: number;
        }[];
        totalBudget: number;
        totalActual: number;
        remaining: number;
    }>;
    importStatement(branchId: string, csv: string): Promise<{
        imported: number;
        duplicatesIgnored: number;
        skippedLines: number[];
        autoMatched: number;
    }>;
    autoMatch(branchId: string): Promise<number>;
    reconciliation(branchId: string, from?: string, to?: string): Promise<{
        summary: {
            total: number;
            matched: number;
            unmatched: number;
            ignored: number;
            moneyIn: number;
            moneyOut: number;
        };
        transactions: {
            id: string;
            postedOn: Date;
            description: string;
            reference: string;
            amount: number;
            status: import("@prisma/client").$Enums.BankTxStatus;
            expense: {
                id: string;
                category: string;
                note: string | null;
                spentOn: Date;
            } | null;
        }[];
    }>;
    setBankStatus(branchId: string, id: string, status: 'UNMATCHED' | 'IGNORED'): Promise<{
        id: string;
        createdAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.BankTxStatus;
        description: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        reference: string;
        postedOn: Date;
        expenseId: string | null;
    }>;
    matchCandidates(branchId: string, id: string): Promise<{
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
    matchManually(branchId: string, id: string, expenseId: string): Promise<{
        id: string;
        createdAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.BankTxStatus;
        description: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        reference: string;
        postedOn: Date;
        expenseId: string | null;
    }>;
    balanceSheet(branchId: string, asOf: string): Promise<{
        asOf: string;
        assets: {
            label: string;
            amount: number;
        }[];
        liabilities: {
            label: string;
            amount: number;
        }[];
        totalAssets: number;
        totalLiabilities: number;
        equity: number;
        note: string;
    }>;
}
