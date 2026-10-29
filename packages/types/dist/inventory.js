"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supplierPaymentSchema = exports.supplierInvoiceSchema = exports.supplierInvoiceStatusSchema = exports.supplierQuotationSchema = exports.supplierQuotationItemSchema = exports.quotationStatusSchema = exports.purchaseRequestSchema = exports.purchaseRequestItemSchema = exports.purchaseRequestStatusSchema = exports.wasteLogSchema = exports.wasteReasonSchema = exports.goodsReceiptSchema = exports.goodsReceiptItemSchema = exports.purchaseOrderStatusSchema = exports.purchaseOrderSchema = exports.purchaseOrderItemSchema = exports.supplierSchema = exports.menuItemTrackingSchema = exports.inventoryTrackingSchema = exports.setRecipeSchema = exports.recipeLineSchema = exports.stockAdjustmentSchema = exports.ingredientSchema = exports.ingredientUnitSchema = void 0;
const zod_1 = require("zod");
const orders_1 = require("./orders");
exports.ingredientUnitSchema = zod_1.z.enum([
    "KG",
    "G",
    "L",
    "ML",
    "PIECE",
    "DOZEN",
    "PACK",
    "BOX",
]);
exports.ingredientSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    sku: zod_1.z.string().optional(),
    unit: exports.ingredientUnitSchema,
    reorderLevel: zod_1.z.coerce.number().nonnegative().default(0),
    isActive: zod_1.z.boolean().default(true),
});
exports.stockAdjustmentSchema = zod_1.z.object({
    quantity: zod_1.z.coerce.number(), // signed: positive to add, negative to remove
    note: zod_1.z.string().min(1),
});
exports.recipeLineSchema = zod_1.z.object({
    ingredientId: zod_1.z.string(),
    quantity: zod_1.z.coerce.number().positive(),
});
exports.setRecipeSchema = zod_1.z.object({
    lines: zod_1.z.array(exports.recipeLineSchema),
});
exports.inventoryTrackingSchema = zod_1.z.enum(["NONE", "RECIPE", "DIRECT"]);
// How selling a menu item moves stock (see InventoryTracking in schema.prisma).
exports.menuItemTrackingSchema = zod_1.z
    .object({
    inventoryTracking: exports.inventoryTrackingSchema,
    stockIngredientId: zod_1.z.string().min(1).nullable().optional(),
    stockQuantityPerSale: zod_1.z.coerce.number().positive().max(100000).optional(),
})
    .refine((v) => v.inventoryTracking !== "DIRECT" || !!v.stockIngredientId, {
    message: "Pick the stock item this product deducts from",
    path: ["stockIngredientId"],
});
exports.supplierSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    contactName: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    address: zod_1.z.string().optional(),
    gstNumber: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().default(true),
});
exports.purchaseOrderItemSchema = zod_1.z.object({
    ingredientId: zod_1.z.string(),
    quantityOrdered: zod_1.z.coerce.number().positive(),
    unitCost: zod_1.z.coerce.number().nonnegative(),
});
exports.purchaseOrderSchema = zod_1.z.object({
    supplierId: zod_1.z.string(),
    expectedDate: zod_1.z.coerce.date().optional(),
    notes: zod_1.z.string().optional(),
    items: zod_1.z.array(exports.purchaseOrderItemSchema).min(1),
});
exports.purchaseOrderStatusSchema = zod_1.z.enum([
    "DRAFT",
    "SENT",
    "PARTIALLY_RECEIVED",
    "RECEIVED",
    "CANCELLED",
]);
exports.goodsReceiptItemSchema = zod_1.z.object({
    ingredientId: zod_1.z.string(),
    purchaseOrderItemId: zod_1.z.string().optional(),
    quantity: zod_1.z.coerce.number().positive(),
    unitCost: zod_1.z.coerce.number().nonnegative(),
    batchNumber: zod_1.z.string().optional(), // auto-generated server-side if omitted
    expiryDate: zod_1.z.coerce.date().optional(),
});
exports.goodsReceiptSchema = zod_1.z.object({
    supplierId: zod_1.z.string(),
    purchaseOrderId: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    items: zod_1.z.array(exports.goodsReceiptItemSchema).min(1),
});
exports.wasteReasonSchema = zod_1.z.enum([
    "EXPIRED",
    "SPOILED",
    "DAMAGED",
    "PREP_ERROR",
    "OVER_PRODUCTION",
    "OTHER",
]);
exports.wasteLogSchema = zod_1.z.object({
    ingredientId: zod_1.z.string(),
    quantity: zod_1.z.coerce.number().positive(),
    reason: exports.wasteReasonSchema,
    notes: zod_1.z.string().optional(),
});
// ---------------------------------------------------------------------------
// Procurement depth — purchase requests, supplier quotations, vendor invoices
// ---------------------------------------------------------------------------
exports.purchaseRequestStatusSchema = zod_1.z.enum([
    "DRAFT",
    "PENDING_APPROVAL",
    "APPROVED",
    "REJECTED",
    "CONVERTED",
]);
exports.purchaseRequestItemSchema = zod_1.z.object({
    ingredientId: zod_1.z.string(),
    quantityRequested: zod_1.z.coerce.number().positive(),
    notes: zod_1.z.string().optional(),
});
exports.purchaseRequestSchema = zod_1.z.object({
    notes: zod_1.z.string().optional(),
    items: zod_1.z.array(exports.purchaseRequestItemSchema).min(1),
});
exports.quotationStatusSchema = zod_1.z.enum([
    "DRAFT",
    "RECEIVED",
    "ACCEPTED",
    "REJECTED",
]);
exports.supplierQuotationItemSchema = zod_1.z.object({
    ingredientId: zod_1.z.string(),
    quantityQuoted: zod_1.z.coerce.number().positive(),
    unitPrice: zod_1.z.coerce.number().nonnegative(),
});
exports.supplierQuotationSchema = zod_1.z.object({
    supplierId: zod_1.z.string(),
    validUntil: zod_1.z.coerce.date().optional(),
    notes: zod_1.z.string().optional(),
    items: zod_1.z.array(exports.supplierQuotationItemSchema).min(1),
});
exports.supplierInvoiceStatusSchema = zod_1.z.enum([
    "UNPAID",
    "PARTIALLY_PAID",
    "PAID",
    "CANCELLED",
]);
exports.supplierInvoiceSchema = zod_1.z.object({
    supplierId: zod_1.z.string(),
    purchaseOrderId: zod_1.z.string().optional(),
    goodsReceiptId: zod_1.z.string().optional(),
    invoiceNumber: zod_1.z.string().min(1),
    invoiceDate: zod_1.z.coerce.date(),
    dueDate: zod_1.z.coerce.date().optional(),
    totalAmount: zod_1.z.coerce.number().positive(),
    notes: zod_1.z.string().optional(),
});
exports.supplierPaymentSchema = zod_1.z.object({
    amount: zod_1.z.coerce.number().positive(),
    paymentMethod: orders_1.paymentMethodSchema,
    reference: zod_1.z.string().optional(),
});
