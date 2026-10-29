import { type SessionUser } from '@nodedr-restaurant/types';
import { BranchAccessService } from '../../common/services/branch-access.service';
import { CustomersService } from './customers.service';
export declare class CustomersController {
    private readonly customersService;
    private readonly branchAccess;
    constructor(customersService: CustomersService, branchAccess: BranchAccessService);
    list(user: SessionUser, branchId: string, search?: string): Promise<{
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
    getById(user: SessionUser, branchId: string, id: string): Promise<{
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
    create(user: SessionUser, branchId: string, body: unknown): Promise<{
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
    update(user: SessionUser, branchId: string, id: string, body: unknown): Promise<{
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
    remove(user: SessionUser, branchId: string, id: string): Promise<{
        ok: boolean;
    }>;
}
