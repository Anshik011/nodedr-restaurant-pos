import { type SessionUser } from '@nodedr-restaurant/types';
import { BranchAccessService } from '../../common/services/branch-access.service';
import { GiftCardsService } from './gift-cards.service';
export declare class GiftCardsController {
    private readonly giftCardsService;
    private readonly branchAccess;
    constructor(giftCardsService: GiftCardsService, branchAccess: BranchAccessService);
    list(user: SessionUser, branchId: string): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        branchId: string;
        customerId: string | null;
        code: string;
        initialValue: import("@prisma/client/runtime/library").Decimal;
        balance: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    getByCode(user: SessionUser, branchId: string, code: string): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        branchId: string;
        customerId: string | null;
        code: string;
        initialValue: import("@prisma/client/runtime/library").Decimal;
        balance: import("@prisma/client/runtime/library").Decimal;
    }>;
    issue(user: SessionUser, branchId: string, body: unknown): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        branchId: string;
        customerId: string | null;
        code: string;
        initialValue: import("@prisma/client/runtime/library").Decimal;
        balance: import("@prisma/client/runtime/library").Decimal;
    }>;
}
