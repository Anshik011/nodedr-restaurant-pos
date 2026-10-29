import { type DeliveryStatusDto, type SessionUser } from '@nodedr-restaurant/types';
import { BranchAccessService } from '../../common/services/branch-access.service';
import { DeliveryService } from './delivery.service';
export declare class DeliveryController {
    private readonly delivery;
    private readonly branchAccess;
    constructor(delivery: DeliveryService, branchAccess: BranchAccessService);
    zones(u: SessionUser, branchId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        isActive: boolean;
        branchId: string;
        fee: import("@prisma/client/runtime/library").Decimal;
        minOrderAmount: import("@prisma/client/runtime/library").Decimal;
        etaMinutes: number;
        pincodes: string[];
    }[]>;
    createZone(u: SessionUser, branchId: string, body: never): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        isActive: boolean;
        branchId: string;
        fee: import("@prisma/client/runtime/library").Decimal;
        minOrderAmount: import("@prisma/client/runtime/library").Decimal;
        etaMinutes: number;
        pincodes: string[];
    }>;
    updateZone(u: SessionUser, branchId: string, id: string, body: never): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        isActive: boolean;
        branchId: string;
        fee: import("@prisma/client/runtime/library").Decimal;
        minOrderAmount: import("@prisma/client/runtime/library").Decimal;
        etaMinutes: number;
        pincodes: string[];
    }>;
    deleteZone(u: SessionUser, branchId: string, id: string): Promise<{
        ok: boolean;
    }>;
    drivers(u: SessionUser, branchId: string): Promise<{
        id: string;
        name: string;
    }[]>;
    list(u: SessionUser, branchId: string, history?: string): Promise<({
        deliveryZone: {
            id: string;
            name: string;
        } | null;
        driver: {
            id: string;
            name: string;
        } | null;
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
    })[]>;
    assign(u: SessionUser, branchId: string, orderId: string, body: {
        driverId: string;
    }): Promise<{
        deliveryZone: {
            id: string;
            name: string;
        } | null;
        driver: {
            id: string;
            name: string;
        } | null;
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
    status(u: SessionUser, branchId: string, orderId: string, body: {
        status: DeliveryStatusDto;
    }): Promise<{
        deliveryZone: {
            id: string;
            name: string;
        } | null;
        driver: {
            id: string;
            name: string;
        } | null;
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
}
