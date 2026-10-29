import { type KioskOrderDto } from '@nodedr-restaurant/types';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { PublicMenuService } from './public-menu.service';
export declare class PublicKioskService {
    private readonly prisma;
    private readonly ordersService;
    private readonly publicMenu;
    constructor(prisma: PrismaService, ordersService: OrdersService, publicMenu: PublicMenuService);
    private resolveBranch;
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
                            priceAdjustment: Prisma.Decimal;
                            isDefault: boolean;
                        }[];
                    };
                }[];
                taxRatePercent: Prisma.Decimal;
                description: string | null;
                imageUrl: string | null;
                price: Prisma.Decimal;
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
    createOrder(kioskToken: string, dto: KioskOrderDto): Promise<{
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
    private findByRequestId;
    private assertAvailable;
    private resolveActor;
    private present;
}
