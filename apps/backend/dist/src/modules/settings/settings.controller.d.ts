import { type SessionUser } from '@nodedr-restaurant/types';
import { BranchAccessService } from '../../common/services/branch-access.service';
import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    private readonly branchAccess;
    constructor(settingsService: SettingsService, branchAccess: BranchAccessService);
    get(user: SessionUser, branchId: string): Promise<{
        restaurant: {
            id: string;
            name: string;
            legalName: string | null;
            logoUrl: string | null;
            currency: string;
            timezone: string;
            upiVpa: string | null;
            upiPayeeName: string | null;
            loyaltyPointValue: import("@prisma/client/runtime/library").Decimal;
            loyaltyEarnPerCurrency: number;
            createdAt: Date;
            updatedAt: Date;
        };
        branch: {
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
        };
    }>;
    updateRestaurant(user: SessionUser, body: unknown): Promise<{
        id: string;
        name: string;
        legalName: string | null;
        logoUrl: string | null;
        currency: string;
        timezone: string;
        upiVpa: string | null;
        upiPayeeName: string | null;
        loyaltyPointValue: import("@prisma/client/runtime/library").Decimal;
        loyaltyEarnPerCurrency: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    uploadRestaurantLogo(file?: Express.Multer.File): {
        url: string;
    };
    updateBranch(user: SessionUser, branchId: string, body: unknown): Promise<{
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
    }>;
    setKiosk(user: SessionUser, branchId: string, action: string): Promise<{
        kioskToken: string | null;
    }>;
}
