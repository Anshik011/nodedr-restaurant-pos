import type { SessionUser } from '@nodedr-restaurant/types';
import { z } from 'zod';
import { BranchAccessService } from '../../common/services/branch-access.service';
import { LedgerService } from './ledger.service';
declare const budgetSchema: z.ZodObject<{
    month: z.ZodString;
    category: z.ZodString;
    amount: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
declare const importSchema: z.ZodObject<{
    csv: z.ZodString;
}, z.core.$strip>;
declare const statusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        UNMATCHED: "UNMATCHED";
        IGNORED: "IGNORED";
    }>;
}, z.core.$strip>;
declare const matchSchema: z.ZodObject<{
    expenseId: z.ZodString;
}, z.core.$strip>;
export declare class LedgerController {
    private readonly ledger;
    private readonly branchAccess;
    constructor(ledger: LedgerService, branchAccess: BranchAccessService);
    private access;
    budgets(u: SessionUser, branchId: string, month: string): Promise<{
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
    saveBudget(u: SessionUser, branchId: string, body: z.infer<typeof budgetSchema>): Promise<{
        id: string;
        category: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        month: string;
    }>;
    deleteBudget(u: SessionUser, branchId: string, id: string): Promise<{
        ok: boolean;
    }>;
    bank(u: SessionUser, branchId: string, from?: string, to?: string): Promise<{
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
    importBank(u: SessionUser, branchId: string, body: z.infer<typeof importSchema>): Promise<{
        imported: number;
        duplicatesIgnored: number;
        skippedLines: number[];
        autoMatched: number;
    }>;
    autoMatch(u: SessionUser, branchId: string): Promise<{
        matched: number;
    }>;
    candidates(u: SessionUser, branchId: string, id: string): Promise<{
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
    match(u: SessionUser, branchId: string, id: string, body: z.infer<typeof matchSchema>): Promise<{
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
    setStatus(u: SessionUser, branchId: string, id: string, body: z.infer<typeof statusSchema>): Promise<{
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
    balanceSheet(u: SessionUser, branchId: string, asOf: string): Promise<{
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
export {};
