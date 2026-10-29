"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicRequestSchema = exports.rejectOrderSchema = exports.rejectKotSchema = exports.kotItemStatusUpdateSchema = exports.cancelOrderSchema = exports.removeOrderItemSchema = exports.updateOrderItemSchema = exports.updateOrderSchema = exports.mergeOrdersSchema = exports.deleteOrdersSchema = exports.refundSchema = exports.checkoutSchema = exports.billPreviewSchema = exports.kioskOrderSchema = exports.kioskServiceTypeSchema = exports.publicOrderSchema = exports.addOrderItemsSchema = exports.createOrderSchema = exports.deliveryStatusUpdateSchema = exports.assignDriverSchema = exports.deliveryZoneUpdateSchema = exports.deliveryZoneSchema = exports.deliveryInfoSchema = exports.deliveryStatusSchema = exports.cartItemSchema = exports.cartItemModifierSchema = exports.paymentMethodSchema = exports.kotStatusSchema = exports.orderTypeSchema = void 0;
const zod_1 = require("zod");
exports.orderTypeSchema = zod_1.z.enum([
    "DINE_IN",
    "TAKEAWAY",
    "DELIVERY",
    "DRIVE_THRU",
    "QR_ORDER",
    "KIOSK",
    "PHONE",
]);
exports.kotStatusSchema = zod_1.z.enum([
    "NEW",
    "ACCEPTED",
    "PREPARING",
    "READY",
    "SERVED",
    "CANCELLED",
    // Kitchen declined the ticket (distinct from CANCELLED, which is the order
    // being withdrawn from the floor). Set only through the reject endpoint.
    "REJECTED",
]);
exports.paymentMethodSchema = zod_1.z.enum([
    "CASH",
    "CARD",
    "UPI",
    "WALLET",
    "BANK_TRANSFER",
    "GIFT_CARD",
    "STORE_CREDIT",
    "OTHER",
]);
exports.cartItemModifierSchema = zod_1.z.object({
    modifierId: zod_1.z.string(),
});
exports.cartItemSchema = zod_1.z.object({
    menuItemId: zod_1.z.string(),
    quantity: zod_1.z.number().int().positive(),
    kitchenNote: zod_1.z.string().optional(),
    modifierIds: zod_1.z.array(zod_1.z.string()).default([]),
    // Half / full portion of an item that has a halfPrice. CUSTOM is a
    // staff-typed price + label (never accepted from customer-facing channels).
    portion: zod_1.z.enum(["HALF", "FULL", "CUSTOM"]).optional(),
    customPrice: zod_1.z.number().nonnegative().max(1_000_000).optional(),
    customLabel: zod_1.z.string().trim().max(40).optional(),
});
// --- Delivery (Phase 5) ---------------------------------------------------
exports.deliveryStatusSchema = zod_1.z.enum([
    "UNASSIGNED",
    "ASSIGNED",
    "PICKED_UP",
    "DELIVERED",
    "FAILED",
]);
exports.deliveryInfoSchema = zod_1.z.object({
    address: zod_1.z.string().trim().min(5).max(300),
    pincode: zod_1.z.string().trim().min(3).max(12),
    phone: zod_1.z.string().trim().min(6).max(20),
});
exports.deliveryZoneSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1).max(60),
    fee: zod_1.z.coerce.number().min(0).default(0),
    minOrderAmount: zod_1.z.coerce.number().min(0).default(0),
    etaMinutes: zod_1.z.coerce.number().int().min(5).max(240).default(45),
    pincodes: zod_1.z.array(zod_1.z.string().trim().min(3).max(12)).min(1),
    isActive: zod_1.z.boolean().default(true),
});
exports.deliveryZoneUpdateSchema = exports.deliveryZoneSchema.partial();
exports.assignDriverSchema = zod_1.z.object({ driverId: zod_1.z.string().min(1) });
exports.deliveryStatusUpdateSchema = zod_1.z.object({
    status: exports.deliveryStatusSchema,
});
exports.createOrderSchema = zod_1.z.object({
    type: exports.orderTypeSchema.default("DINE_IN"),
    tableId: zod_1.z.string().optional(),
    guestCount: zod_1.z.number().int().positive().optional(),
    customerId: zod_1.z.string().optional(),
    guestName: zod_1.z.string().trim().min(1).max(60).optional(),
    notes: zod_1.z.string().optional(),
    // Required when type is DELIVERY (validated against the branch's zones).
    delivery: exports.deliveryInfoSchema.optional(),
    // Scheduled order: ISO time in the future; the kitchen starts then.
    scheduledFor: zod_1.z.string().datetime().optional(),
    items: zod_1.z.array(exports.cartItemSchema).min(1),
});
exports.addOrderItemsSchema = zod_1.z.object({
    items: zod_1.z.array(exports.cartItemSchema).min(1),
});
// Guest self-order from a table's QR code — no account, so a name is the
// only way staff can tell whose order this is (shown on KDS/order lists).
exports.publicOrderSchema = zod_1.z.object({
    guestName: zod_1.z.string().trim().min(1, "Please enter your name").max(60),
    items: zod_1.z.array(exports.cartItemSchema).min(1),
});
// Self-service kiosk order. No name or any other personal data is collected.
// requestId is a client-generated idempotency key: the kiosk keeps the same
// one for every retry of the same basket, so a dropped connection can never
// turn into a second order. Free-text kitchen notes are deliberately not
// accepted on this unauthenticated surface.
exports.kioskServiceTypeSchema = zod_1.z.enum(["DINE_IN", "TAKEAWAY"]);
exports.kioskOrderSchema = zod_1.z.object({
    requestId: zod_1.z.string().uuid(),
    serviceType: exports.kioskServiceTypeSchema,
    items: zod_1.z
        .array(zod_1.z.object({
        menuItemId: zod_1.z.string().min(1).max(64),
        quantity: zod_1.z.number().int().positive().max(20),
        modifierIds: zod_1.z.array(zod_1.z.string().max(64)).max(30).default([]),
    }))
        .min(1)
        .max(50),
});
// What a cashier may enter against a bill. Shared by the bill preview and
// checkout so the figures on the printed bill are exactly what is charged.
const billAdjustmentFields = {
    discountPercent: zod_1.z.coerce.number().min(0).max(100).optional(),
    discountFlat: zod_1.z.coerce.number().min(0).optional(),
    tipAmount: zod_1.z.coerce.number().min(0).optional(),
    loyaltyPointsToRedeem: zod_1.z.coerce.number().int().min(0).optional(),
    couponCode: zod_1.z.string().trim().min(3).max(24).optional(),
};
exports.billPreviewSchema = zod_1.z.object({
    ...billAdjustmentFields,
});
exports.checkoutSchema = zod_1.z.object({
    ...billAdjustmentFields,
    customerId: zod_1.z.string().optional(),
    giftCardCode: zod_1.z.string().optional(),
    payments: zod_1.z
        .array(zod_1.z.object({
        method: exports.paymentMethodSchema,
        // Amount applied to the bill.
        amount: zod_1.z.coerce.number().positive(),
        // Cash handed over, when more than `amount` (the difference is the
        // change given back). Only meaningful for CASH.
        tendered: zod_1.z.coerce.number().positive().optional(),
        reference: zod_1.z.string().optional(),
    }))
        .default([]),
    // Record these payments without closing the bill when they do not cover it
    // (the rest stays as an outstanding balance). Without it, a short payment
    // is rejected, as before.
    allowPartial: zod_1.z.boolean().optional(),
    // One per checkout attempt; a repeat of the same key is answered with the
    // original result instead of charging again.
    requestId: zod_1.z.string().min(8).max(64).optional(),
});
exports.refundSchema = zod_1.z.object({
    amount: zod_1.z.coerce.number().positive(),
    reason: zod_1.z.string().optional(),
    method: exports.paymentMethodSchema,
    // Units physically handed back with this refund. Only these are returned to
    // stock; omit for a money-only refund (stock is left as consumed).
    returnedItems: zod_1.z
        .array(zod_1.z.object({
        orderItemId: zod_1.z.string().min(1),
        quantity: zod_1.z.coerce.number().int().positive(),
    }))
        .max(100)
        .optional(),
});
// Admin-only permanent delete of finished orders; the caller re-enters their
// own password so a left-open session cannot wipe sales history.
exports.deleteOrdersSchema = zod_1.z.object({
    orderIds: zod_1.z.array(zod_1.z.string().min(1)).min(1).max(200),
    password: zod_1.z.string().min(1),
});
exports.mergeOrdersSchema = zod_1.z.object({
    sourceOrderId: zod_1.z.string(),
});
// Edit an open bill: move it to another table and/or fix header details.
exports.updateOrderSchema = zod_1.z
    .object({
    tableId: zod_1.z.string().min(1).optional(),
    guestName: zod_1.z.string().trim().max(80).nullable().optional(),
    guestCount: zod_1.z.number().int().min(1).max(100).nullable().optional(),
    notes: zod_1.z.string().trim().max(500).nullable().optional(),
    customerId: zod_1.z.string().min(1).nullable().optional(),
})
    .refine((v) => Object.keys(v).length > 0, "Nothing to change");
// Correct one line of an open bill. Lowering a quantity or removing a line is
// only possible while the kitchen has not started it; adding more goes
// through "add items" so the kitchen gets a fresh ticket.
exports.updateOrderItemSchema = zod_1.z.object({
    quantity: zod_1.z.number().int().min(1).max(999),
    reason: zod_1.z.string().trim().max(200).optional(),
});
exports.removeOrderItemSchema = zod_1.z.object({
    reason: zod_1.z.string().trim().min(1, "A reason is required").max(200),
});
exports.cancelOrderSchema = zod_1.z.object({
    reason: zod_1.z.string().trim().min(1, "A reason is required").max(200),
    // Required to cancel once the kitchen has started cooking: an explicit
    // acknowledgement that food is already in progress.
    confirmStarted: zod_1.z.boolean().optional(),
    // Who asked for it: staff by default, or the guest changing their mind.
    source: zod_1.z.enum(["STAFF", "CUSTOMER"]).optional(),
});
// Forward moves only. Declining a ticket goes through rejectKotSchema and
// withdrawing an order through cancelOrderSchema, so neither can be reached by
// sending an arbitrary status here.
exports.kotItemStatusUpdateSchema = zod_1.z.object({
    status: zod_1.z.enum(["ACCEPTED", "PREPARING", "READY", "SERVED"]),
});
exports.rejectKotSchema = zod_1.z.object({
    reason: zod_1.z.string().trim().min(1, "A reason is required").max(200),
    // Needed once the kitchen has started cooking the ticket.
    confirmStarted: zod_1.z.boolean().optional(),
});
exports.rejectOrderSchema = zod_1.z.object({
    reason: zod_1.z.string().trim().min(1, "A reason is required").max(200),
});
exports.publicRequestSchema = zod_1.z.object({ type: zod_1.z.enum(["WAITER", "BILL"]) });
