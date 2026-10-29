import type { SessionUser } from '@nodedr-restaurant/types';
import { PrismaService } from '../../prisma/prisma.service';
export declare class BranchesController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listBranches(user: SessionUser): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        kioskToken: string | null;
        restaurantId: string;
        address: string | null;
        phone: string | null;
        gstNumber: string | null;
        country: string;
        taxRegime: import("@prisma/client").$Enums.TaxRegime;
        taxMode: import("@prisma/client").$Enums.TaxMode;
        taxLabel: string | null;
        taxId: string | null;
        autoConfirmOrders: boolean;
        autoConfirmReservations: boolean;
        kioskDineInEnabled: boolean;
        kioskTakeawayEnabled: boolean;
        printerPaperWidthMm: number;
        printerCodepage: string;
        printerColumns: number | null;
        printerConnection: string;
        printerHost: string | null;
        printerPort: number;
        isActive: boolean;
    }[]>;
}
