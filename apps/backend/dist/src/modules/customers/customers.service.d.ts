import type { CustomerDto } from '@nodedr-restaurant/types';
import { PrismaService } from '../../prisma/prisma.service';
export declare class CustomersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(branchId: string, search?: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string | null;
        createdAt: Date;
        address: string | null;
        phone: string | null;
        email: string | null;
        branchId: string;
        notes: string | null;
        birthday: Date | null;
        anniversary: Date | null;
        allergies: string | null;
        loyaltyPoints: number;
        marketingOptOut: boolean;
        walletBalance: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    getById(branchId: string, id: string): Promise<{
        orders: {
            id: string;
            orderNumber: string;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            billedAt: Date | null;
        }[];
        giftCards: {
            id: string;
            createdAt: Date;
            isActive: boolean;
            branchId: string;
            customerId: string | null;
            code: string;
            initialValue: import("@prisma/client/runtime/library").Decimal;
            balance: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        name: string | null;
        createdAt: Date;
        address: string | null;
        phone: string | null;
        email: string | null;
        branchId: string;
        notes: string | null;
        birthday: Date | null;
        anniversary: Date | null;
        allergies: string | null;
        loyaltyPoints: number;
        marketingOptOut: boolean;
        walletBalance: import("@prisma/client/runtime/library").Decimal;
    }>;
    create(branchId: string, dto: CustomerDto): import("@prisma/client").Prisma.Prisma__CustomerClient<{
        id: string;
        name: string | null;
        createdAt: Date;
        address: string | null;
        phone: string | null;
        email: string | null;
        branchId: string;
        notes: string | null;
        birthday: Date | null;
        anniversary: Date | null;
        allergies: string | null;
        loyaltyPoints: number;
        marketingOptOut: boolean;
        walletBalance: import("@prisma/client/runtime/library").Decimal;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(branchId: string, id: string, dto: Partial<CustomerDto>): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        address: string | null;
        phone: string | null;
        email: string | null;
        branchId: string;
        notes: string | null;
        birthday: Date | null;
        anniversary: Date | null;
        allergies: string | null;
        loyaltyPoints: number;
        marketingOptOut: boolean;
        walletBalance: import("@prisma/client/runtime/library").Decimal;
    }>;
    remove(branchId: string, id: string): Promise<{
        ok: boolean;
    }>;
    private assertInBranch;
}
