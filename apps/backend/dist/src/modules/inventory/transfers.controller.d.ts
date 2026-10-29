import type { SessionUser } from '@nodedr-restaurant/types';
import { z } from 'zod';
import { BranchAccessService } from '../../common/services/branch-access.service';
import { TransfersService } from './transfers.service';
declare const transferSchema: z.ZodObject<{
    toBranchId: z.ZodString;
    ingredientId: z.ZodString;
    quantity: z.ZodCoercedNumber<unknown>;
    note: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare class TransfersController {
    private readonly transfers;
    private readonly branchAccess;
    constructor(transfers: TransfersService, branchAccess: BranchAccessService);
    list(u: SessionUser, branchId: string): Promise<{
        history: {
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
        }[];
        branches: {
            id: string;
            name: string;
        }[];
    }>;
    create(u: SessionUser, branchId: string, body: z.infer<typeof transferSchema>): Promise<{
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
export {};
