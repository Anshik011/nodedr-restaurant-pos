import { z } from "zod";
export declare const orderTypeSchema: z.ZodEnum<{
    DINE_IN: "DINE_IN";
    TAKEAWAY: "TAKEAWAY";
    DELIVERY: "DELIVERY";
    DRIVE_THRU: "DRIVE_THRU";
    QR_ORDER: "QR_ORDER";
    KIOSK: "KIOSK";
    PHONE: "PHONE";
}>;
export type OrderTypeDto = z.infer<typeof orderTypeSchema>;
export declare const kotStatusSchema: z.ZodEnum<{
    REJECTED: "REJECTED";
    NEW: "NEW";
    ACCEPTED: "ACCEPTED";
    PREPARING: "PREPARING";
    READY: "READY";
    SERVED: "SERVED";
    CANCELLED: "CANCELLED";
}>;
export type KotStatusDto = z.infer<typeof kotStatusSchema>;
export declare const paymentMethodSchema: z.ZodEnum<{
    OTHER: "OTHER";
    CASH: "CASH";
    CARD: "CARD";
    UPI: "UPI";
    WALLET: "WALLET";
    BANK_TRANSFER: "BANK_TRANSFER";
    GIFT_CARD: "GIFT_CARD";
    STORE_CREDIT: "STORE_CREDIT";
}>;
export type PaymentMethodDto = z.infer<typeof paymentMethodSchema>;
export declare const cartItemModifierSchema: z.ZodObject<{
    modifierId: z.ZodString;
}, z.core.$strip>;
export declare const cartItemSchema: z.ZodObject<{
    menuItemId: z.ZodString;
    quantity: z.ZodNumber;
    kitchenNote: z.ZodOptional<z.ZodString>;
    modifierIds: z.ZodDefault<z.ZodArray<z.ZodString>>;
    portion: z.ZodOptional<z.ZodEnum<{
        HALF: "HALF";
        FULL: "FULL";
        CUSTOM: "CUSTOM";
    }>>;
    customPrice: z.ZodOptional<z.ZodNumber>;
    customLabel: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CartItemDto = z.infer<typeof cartItemSchema>;
export declare const deliveryStatusSchema: z.ZodEnum<{
    UNASSIGNED: "UNASSIGNED";
    ASSIGNED: "ASSIGNED";
    PICKED_UP: "PICKED_UP";
    DELIVERED: "DELIVERED";
    FAILED: "FAILED";
}>;
export type DeliveryStatusDto = z.infer<typeof deliveryStatusSchema>;
export declare const deliveryInfoSchema: z.ZodObject<{
    address: z.ZodString;
    pincode: z.ZodString;
    phone: z.ZodString;
}, z.core.$strip>;
export type DeliveryInfoDto = z.infer<typeof deliveryInfoSchema>;
export declare const deliveryZoneSchema: z.ZodObject<{
    name: z.ZodString;
    fee: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    minOrderAmount: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    etaMinutes: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    pincodes: z.ZodArray<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export type DeliveryZoneDto = z.infer<typeof deliveryZoneSchema>;
export declare const deliveryZoneUpdateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    fee: z.ZodOptional<z.ZodDefault<z.ZodCoercedNumber<unknown>>>;
    minOrderAmount: z.ZodOptional<z.ZodDefault<z.ZodCoercedNumber<unknown>>>;
    etaMinutes: z.ZodOptional<z.ZodDefault<z.ZodCoercedNumber<unknown>>>;
    pincodes: z.ZodOptional<z.ZodArray<z.ZodString>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, z.core.$strip>;
export type DeliveryZoneUpdateDto = z.infer<typeof deliveryZoneUpdateSchema>;
export declare const assignDriverSchema: z.ZodObject<{
    driverId: z.ZodString;
}, z.core.$strip>;
export declare const deliveryStatusUpdateSchema: z.ZodObject<{
    status: z.ZodEnum<{
        UNASSIGNED: "UNASSIGNED";
        ASSIGNED: "ASSIGNED";
        PICKED_UP: "PICKED_UP";
        DELIVERED: "DELIVERED";
        FAILED: "FAILED";
    }>;
}, z.core.$strip>;
export declare const createOrderSchema: z.ZodObject<{
    type: z.ZodDefault<z.ZodEnum<{
        DINE_IN: "DINE_IN";
        TAKEAWAY: "TAKEAWAY";
        DELIVERY: "DELIVERY";
        DRIVE_THRU: "DRIVE_THRU";
        QR_ORDER: "QR_ORDER";
        KIOSK: "KIOSK";
        PHONE: "PHONE";
    }>>;
    tableId: z.ZodOptional<z.ZodString>;
    guestCount: z.ZodOptional<z.ZodNumber>;
    customerId: z.ZodOptional<z.ZodString>;
    guestName: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    delivery: z.ZodOptional<z.ZodObject<{
        address: z.ZodString;
        pincode: z.ZodString;
        phone: z.ZodString;
    }, z.core.$strip>>;
    scheduledFor: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        menuItemId: z.ZodString;
        quantity: z.ZodNumber;
        kitchenNote: z.ZodOptional<z.ZodString>;
        modifierIds: z.ZodDefault<z.ZodArray<z.ZodString>>;
        portion: z.ZodOptional<z.ZodEnum<{
            HALF: "HALF";
            FULL: "FULL";
            CUSTOM: "CUSTOM";
        }>>;
        customPrice: z.ZodOptional<z.ZodNumber>;
        customLabel: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type CreateOrderDto = z.infer<typeof createOrderSchema>;
export declare const addOrderItemsSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        menuItemId: z.ZodString;
        quantity: z.ZodNumber;
        kitchenNote: z.ZodOptional<z.ZodString>;
        modifierIds: z.ZodDefault<z.ZodArray<z.ZodString>>;
        portion: z.ZodOptional<z.ZodEnum<{
            HALF: "HALF";
            FULL: "FULL";
            CUSTOM: "CUSTOM";
        }>>;
        customPrice: z.ZodOptional<z.ZodNumber>;
        customLabel: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type AddOrderItemsDto = z.infer<typeof addOrderItemsSchema>;
export declare const publicOrderSchema: z.ZodObject<{
    guestName: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        menuItemId: z.ZodString;
        quantity: z.ZodNumber;
        kitchenNote: z.ZodOptional<z.ZodString>;
        modifierIds: z.ZodDefault<z.ZodArray<z.ZodString>>;
        portion: z.ZodOptional<z.ZodEnum<{
            HALF: "HALF";
            FULL: "FULL";
            CUSTOM: "CUSTOM";
        }>>;
        customPrice: z.ZodOptional<z.ZodNumber>;
        customLabel: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type PublicOrderDto = z.infer<typeof publicOrderSchema>;
export declare const kioskServiceTypeSchema: z.ZodEnum<{
    DINE_IN: "DINE_IN";
    TAKEAWAY: "TAKEAWAY";
}>;
export type KioskServiceType = z.infer<typeof kioskServiceTypeSchema>;
export declare const kioskOrderSchema: z.ZodObject<{
    requestId: z.ZodString;
    serviceType: z.ZodEnum<{
        DINE_IN: "DINE_IN";
        TAKEAWAY: "TAKEAWAY";
    }>;
    items: z.ZodArray<z.ZodObject<{
        menuItemId: z.ZodString;
        quantity: z.ZodNumber;
        modifierIds: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type KioskOrderDto = z.infer<typeof kioskOrderSchema>;
export declare const billPreviewSchema: z.ZodObject<{
    discountPercent: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    discountFlat: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    tipAmount: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    loyaltyPointsToRedeem: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    couponCode: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type BillPreviewDto = z.infer<typeof billPreviewSchema>;
export declare const checkoutSchema: z.ZodObject<{
    customerId: z.ZodOptional<z.ZodString>;
    giftCardCode: z.ZodOptional<z.ZodString>;
    payments: z.ZodDefault<z.ZodArray<z.ZodObject<{
        method: z.ZodEnum<{
            OTHER: "OTHER";
            CASH: "CASH";
            CARD: "CARD";
            UPI: "UPI";
            WALLET: "WALLET";
            BANK_TRANSFER: "BANK_TRANSFER";
            GIFT_CARD: "GIFT_CARD";
            STORE_CREDIT: "STORE_CREDIT";
        }>;
        amount: z.ZodCoercedNumber<unknown>;
        tendered: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        reference: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    allowPartial: z.ZodOptional<z.ZodBoolean>;
    requestId: z.ZodOptional<z.ZodString>;
    discountPercent: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    discountFlat: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    tipAmount: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    loyaltyPointsToRedeem: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    couponCode: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CheckoutDto = z.infer<typeof checkoutSchema>;
export declare const refundSchema: z.ZodObject<{
    amount: z.ZodCoercedNumber<unknown>;
    reason: z.ZodOptional<z.ZodString>;
    method: z.ZodEnum<{
        OTHER: "OTHER";
        CASH: "CASH";
        CARD: "CARD";
        UPI: "UPI";
        WALLET: "WALLET";
        BANK_TRANSFER: "BANK_TRANSFER";
        GIFT_CARD: "GIFT_CARD";
        STORE_CREDIT: "STORE_CREDIT";
    }>;
    returnedItems: z.ZodOptional<z.ZodArray<z.ZodObject<{
        orderItemId: z.ZodString;
        quantity: z.ZodCoercedNumber<unknown>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type RefundDto = z.infer<typeof refundSchema>;
export declare const deleteOrdersSchema: z.ZodObject<{
    orderIds: z.ZodArray<z.ZodString>;
    password: z.ZodString;
}, z.core.$strip>;
export type DeleteOrdersDto = z.infer<typeof deleteOrdersSchema>;
export declare const mergeOrdersSchema: z.ZodObject<{
    sourceOrderId: z.ZodString;
}, z.core.$strip>;
export type MergeOrdersDto = z.infer<typeof mergeOrdersSchema>;
export declare const updateOrderSchema: z.ZodObject<{
    tableId: z.ZodOptional<z.ZodString>;
    guestName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    guestCount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    customerId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export type UpdateOrderDto = z.infer<typeof updateOrderSchema>;
export declare const updateOrderItemSchema: z.ZodObject<{
    quantity: z.ZodNumber;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UpdateOrderItemDto = z.infer<typeof updateOrderItemSchema>;
export declare const removeOrderItemSchema: z.ZodObject<{
    reason: z.ZodString;
}, z.core.$strip>;
export type RemoveOrderItemDto = z.infer<typeof removeOrderItemSchema>;
export declare const cancelOrderSchema: z.ZodObject<{
    reason: z.ZodString;
    confirmStarted: z.ZodOptional<z.ZodBoolean>;
    source: z.ZodOptional<z.ZodEnum<{
        STAFF: "STAFF";
        CUSTOMER: "CUSTOMER";
    }>>;
}, z.core.$strip>;
export type CancelOrderDto = z.infer<typeof cancelOrderSchema>;
export declare const kotItemStatusUpdateSchema: z.ZodObject<{
    status: z.ZodEnum<{
        ACCEPTED: "ACCEPTED";
        PREPARING: "PREPARING";
        READY: "READY";
        SERVED: "SERVED";
    }>;
}, z.core.$strip>;
export type KotItemStatusUpdateDto = z.infer<typeof kotItemStatusUpdateSchema>;
export declare const rejectKotSchema: z.ZodObject<{
    reason: z.ZodString;
    confirmStarted: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type RejectKotDto = z.infer<typeof rejectKotSchema>;
export declare const rejectOrderSchema: z.ZodObject<{
    reason: z.ZodString;
}, z.core.$strip>;
export type RejectOrderDto = z.infer<typeof rejectOrderSchema>;
export declare const publicRequestSchema: z.ZodObject<{
    type: z.ZodEnum<{
        WAITER: "WAITER";
        BILL: "BILL";
    }>;
}, z.core.$strip>;
export type PublicRequestDto = z.infer<typeof publicRequestSchema>;
