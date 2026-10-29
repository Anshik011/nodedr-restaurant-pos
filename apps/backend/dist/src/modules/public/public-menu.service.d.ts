import type { CartItemDto } from '@nodedr-restaurant/types';
import { NotificationsService } from '../../notifications/notifications.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RealtimeGateway } from '../../realtime/realtime.gateway';
import { OrdersService } from '../orders/orders.service';
export declare class PublicMenuService {
    private readonly prisma;
    private readonly ordersService;
    private readonly notifications;
    private readonly realtime;
    constructor(prisma: PrismaService, ordersService: OrdersService, notifications: NotificationsService, realtime: RealtimeGateway);
    private resolveTable;
    getMenuByQrToken(qrToken: string): Promise<{
        branchName: string;
        tableName: string;
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
    menuCategoriesForBranch(branchId: string): import("@prisma/client").Prisma.PrismaPromise<({
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
    })[]>;
    createOrder(qrToken: string, items: CartItemDto[], guestName: string): Promise<{
        table: {
            number: string;
            id: string;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            qrToken: string | null;
            floorId: string;
            capacity: number;
            status: import("@prisma/client").$Enums.TableStatus;
            statusSince: Date;
            posX: number;
            posY: number;
            width: number;
            height: number;
            rotation: number;
            shape: string;
            color: string | null;
            assignedWaiterId: string | null;
            notes: string | null;
        } | null;
        items: ({
            modifiers: {
                id: string;
                nameSnapshot: string;
                orderItemId: string;
                modifierId: string;
                priceAdjSnapshot: import("@prisma/client/runtime/library").Decimal;
            }[];
            menuItem: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                branchId: string;
                sortOrder: number;
                taxRatePercent: import("@prisma/client/runtime/library").Decimal;
                categoryId: string;
                stationId: string | null;
                sku: string | null;
                description: string | null;
                imageUrl: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                costPrice: import("@prisma/client/runtime/library").Decimal | null;
                prepTimeMinutes: number | null;
                calories: number | null;
                isVeg: boolean;
                isVegan: boolean;
                isJain: boolean;
                isHalal: boolean;
                isGlutenFree: boolean;
                spiceLevel: import("@prisma/client").$Enums.SpiceLevel;
                allergens: string[];
                availableFrom: string | null;
                availableTo: string | null;
                isSeasonal: boolean;
                seasonStart: Date | null;
                seasonEnd: Date | null;
                barcode: string | null;
                isCombo: boolean;
                inventoryTracking: import("@prisma/client").$Enums.InventoryTracking;
                stockIngredientId: string | null;
                stockQuantityPerSale: import("@prisma/client/runtime/library").Decimal;
                halfPrice: import("@prisma/client/runtime/library").Decimal | null;
            };
        } & {
            id: string;
            status: import("@prisma/client").$Enums.KotItemStatus;
            kitchenNote: string | null;
            orderId: string;
            menuItemId: string;
            nameSnapshot: string;
            unitPriceSnapshot: import("@prisma/client/runtime/library").Decimal;
            taxRateSnapshot: import("@prisma/client/runtime/library").Decimal;
            quantity: number;
            lineTotal: import("@prisma/client/runtime/library").Decimal;
        })[];
        kots: ({
            items: {
                id: string;
                status: import("@prisma/client").$Enums.KotItemStatus;
                kotId: string;
                orderItemId: string;
            }[];
            station: {
                id: string;
                name: string;
                branchId: string;
                printerName: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            status: import("@prisma/client").$Enums.KotStatus;
            stationId: string | null;
            acceptedAt: Date | null;
            acceptedById: string | null;
            orderId: string;
            ticketNumber: string;
            isPriority: boolean;
            printedCount: number;
            printedAt: Date | null;
            lastPrintError: string | null;
            readyAt: Date | null;
            servedAt: Date | null;
            rejectedAt: Date | null;
            rejectedById: string | null;
            rejectReason: string | null;
        })[];
        customer: {
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
        } | null;
        payments: {
            id: string;
            createdAt: Date;
            createdById: string | null;
            clientRequestId: string | null;
            method: import("@prisma/client").$Enums.PaymentMethod;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            tendered: import("@prisma/client/runtime/library").Decimal | null;
            changeGiven: import("@prisma/client/runtime/library").Decimal | null;
            orderId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        notes: string | null;
        orderNumber: string;
        type: import("@prisma/client").$Enums.OrderType;
        channel: import("@prisma/client").$Enums.OrderChannel;
        acceptance: import("@prisma/client").$Enums.AcceptanceStatus;
        tableId: string | null;
        guestCount: number | null;
        guestName: string | null;
        customerId: string | null;
        createdById: string;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        tipAmount: import("@prisma/client/runtime/library").Decimal;
        loyaltyPointsRedeemed: number;
        loyaltyDiscountAmount: import("@prisma/client/runtime/library").Decimal;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        cancelReason: string | null;
        cancelledAt: Date | null;
        cancelledById: string | null;
        cancelSource: import("@prisma/client").$Enums.CancelSource | null;
        acceptedAt: Date | null;
        acceptedById: string | null;
        discountType: import("@prisma/client").$Enums.ManualDiscountType | null;
        discountValue: import("@prisma/client/runtime/library").Decimal | null;
        clientRequestId: string | null;
        deliveryZoneId: string | null;
        deliveryFee: import("@prisma/client/runtime/library").Decimal;
        deliveryAddress: string | null;
        deliveryPincode: string | null;
        deliveryPhone: string | null;
        deliveryStatus: import("@prisma/client").$Enums.DeliveryStatus | null;
        driverId: string | null;
        deliveryEtaAt: Date | null;
        deliveredAt: Date | null;
        scheduledFor: Date | null;
        couponCode: string | null;
        promotionName: string | null;
        billedAt: Date | null;
    }>;
    getStatus(qrToken: string): Promise<{
        order: {
            status: import("@prisma/client").$Enums.OrderStatus;
            items: {
                id: string;
                status: import("@prisma/client").$Enums.KotItemStatus;
                nameSnapshot: string;
                quantity: number;
            }[];
            orderNumber: string;
            acceptance: import("@prisma/client").$Enums.AcceptanceStatus;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
        } | null;
        openRequests: import("@prisma/client").$Enums.TableRequestType[];
    }>;
    createRequest(qrToken: string, type: 'WAITER' | 'BILL'): Promise<{
        ok: boolean;
        alreadyRequested: boolean;
    }>;
}
