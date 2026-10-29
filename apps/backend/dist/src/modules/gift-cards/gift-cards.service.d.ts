import type { Prisma } from '@prisma/client';
import type { IssueGiftCardDto } from '@nodedr-restaurant/types';
import { PrismaService } from '../../prisma/prisma.service';
export declare class GiftCardsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(branchId: string): Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        branchId: string;
        customerId: string | null;
        code: string;
        initialValue: Prisma.Decimal;
        balance: Prisma.Decimal;
    }[]>;
    issue(branchId: string, dto: IssueGiftCardDto): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        branchId: string;
        customerId: string | null;
        code: string;
        initialValue: Prisma.Decimal;
        balance: Prisma.Decimal;
    }>;
    getByCode(branchId: string, code: string): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        branchId: string;
        customerId: string | null;
        code: string;
        initialValue: Prisma.Decimal;
        balance: Prisma.Decimal;
    }>;
    debit(tx: Prisma.TransactionClient, branchId: string, code: string, maxAmount: number): Promise<{
        giftCardId: string;
        amountApplied: number;
    }>;
}
