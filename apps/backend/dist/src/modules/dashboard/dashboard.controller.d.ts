import type { SessionUser } from '@nodedr-restaurant/types';
import { BranchAccessService } from '../../common/services/branch-access.service';
import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    private readonly branchAccess;
    constructor(dashboardService: DashboardService, branchAccess: BranchAccessService);
    getSummary(user: SessionUser, branchId: string): Promise<{
        todayRevenue: number;
        todayOrders: number;
        channels: {
            online: number;
            offline: number;
        };
        tables: {
            available: number;
            occupied: number;
            reserved: number;
            cleaning: number;
            outOfService: number;
        };
        kitchenQueue: {
            new: number;
            accepted: number;
            preparing: number;
            ready: number;
        };
        recentOrders: {
            id: string;
            orderNumber: string;
            type: import("@prisma/client").$Enums.OrderType;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            billedAt: Date | null;
        }[];
    }>;
    getTrends(user: SessionUser, branchId: string): Promise<{
        revenue: {
            date: string;
            amount: number;
        }[];
        waste: {
            date: string;
            cost: number;
        }[];
    }>;
}
