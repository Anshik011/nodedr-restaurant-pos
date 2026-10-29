import { PrismaService } from '../../prisma/prisma.service';
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSummary(branchId: string): Promise<{
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
    getTrends(branchId: string, days?: number): Promise<{
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
