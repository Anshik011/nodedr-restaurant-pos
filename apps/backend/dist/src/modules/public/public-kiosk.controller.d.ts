import { PublicKioskService } from './public-kiosk.service';
export declare class PublicKioskController {
    private readonly kiosk;
    constructor(kiosk: PublicKioskService);
    getMenu(kioskToken: string): Promise<{
        restaurantName: string;
        branchName: string;
        logoUrl: string | null;
        currency: string;
        country: string;
        taxMode: import("@prisma/client").$Enums.TaxMode;
        taxLabel: string;
        services: {
            dineIn: boolean;
            takeaway: boolean;
        };
        categories: ({
            items: {
                id: string;
                name: string;
                modifierGroups: {
                    modifierGroup: {
                        id: string;
                        name: string;
                        minSelect: number;
                        maxSelect: number;
                        isRequired: boolean;
                        modifiers: {
                            id: string;
                            name: string;
                            priceAdjustment: import("@prisma/client/runtime/library").Decimal;
                            isDefault: boolean;
                        }[];
                    };
                }[];
                taxRatePercent: import("@prisma/client/runtime/library").Decimal;
                description: string | null;
                imageUrl: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                isVeg: boolean;
                isVegan: boolean;
                spiceLevel: import("@prisma/client").$Enums.SpiceLevel;
                allergens: string[];
            }[];
        } & {
            id: string;
            name: string;
            isActive: boolean;
            branchId: string;
            sortOrder: number;
            showOnWebsite: boolean;
        })[];
    }>;
    createOrder(kioskToken: string, body: unknown): Promise<{
        orderNumber: string;
        createdAt: Date;
        currency: string;
        items: {
            name: string;
            quantity: number;
            lineTotal: string;
        }[];
        subtotal: string;
        taxAmount: string;
        totalAmount: string;
        paid: boolean;
    }>;
}
