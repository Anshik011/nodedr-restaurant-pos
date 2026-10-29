import { z } from "zod";
export declare const ingredientUnitSchema: z.ZodEnum<{
    KG: "KG";
    G: "G";
    L: "L";
    ML: "ML";
    PIECE: "PIECE";
    DOZEN: "DOZEN";
    PACK: "PACK";
    BOX: "BOX";
}>;
export type IngredientUnit = z.infer<typeof ingredientUnitSchema>;
export declare const ingredientSchema: z.ZodObject<{
    name: z.ZodString;
    sku: z.ZodOptional<z.ZodString>;
    unit: z.ZodEnum<{
        KG: "KG";
        G: "G";
        L: "L";
        ML: "ML";
        PIECE: "PIECE";
        DOZEN: "DOZEN";
        PACK: "PACK";
        BOX: "BOX";
    }>;
    reorderLevel: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export type IngredientDto = z.infer<typeof ingredientSchema>;
export declare const stockAdjustmentSchema: z.ZodObject<{
    quantity: z.ZodCoercedNumber<unknown>;
    note: z.ZodString;
}, z.core.$strip>;
export type StockAdjustmentDto = z.infer<typeof stockAdjustmentSchema>;
export declare const recipeLineSchema: z.ZodObject<{
    ingredientId: z.ZodString;
    quantity: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
export type RecipeLineDto = z.infer<typeof recipeLineSchema>;
export declare const setRecipeSchema: z.ZodObject<{
    lines: z.ZodArray<z.ZodObject<{
        ingredientId: z.ZodString;
        quantity: z.ZodCoercedNumber<unknown>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type SetRecipeDto = z.infer<typeof setRecipeSchema>;
export declare const inventoryTrackingSchema: z.ZodEnum<{
    NONE: "NONE";
    RECIPE: "RECIPE";
    DIRECT: "DIRECT";
}>;
export type InventoryTrackingDto = z.infer<typeof inventoryTrackingSchema>;
export declare const menuItemTrackingSchema: z.ZodObject<{
    inventoryTracking: z.ZodEnum<{
        NONE: "NONE";
        RECIPE: "RECIPE";
        DIRECT: "DIRECT";
    }>;
    stockIngredientId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    stockQuantityPerSale: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type MenuItemTrackingDto = z.infer<typeof menuItemTrackingSchema>;
export declare const supplierSchema: z.ZodObject<{
    name: z.ZodString;
    contactName: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    gstNumber: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export type SupplierDto = z.infer<typeof supplierSchema>;
export declare const purchaseOrderItemSchema: z.ZodObject<{
    ingredientId: z.ZodString;
    quantityOrdered: z.ZodCoercedNumber<unknown>;
    unitCost: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
export type PurchaseOrderItemDto = z.infer<typeof purchaseOrderItemSchema>;
export declare const purchaseOrderSchema: z.ZodObject<{
    supplierId: z.ZodString;
    expectedDate: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    notes: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        ingredientId: z.ZodString;
        quantityOrdered: z.ZodCoercedNumber<unknown>;
        unitCost: z.ZodCoercedNumber<unknown>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type PurchaseOrderDto = z.infer<typeof purchaseOrderSchema>;
export declare const purchaseOrderStatusSchema: z.ZodEnum<{
    CANCELLED: "CANCELLED";
    DRAFT: "DRAFT";
    SENT: "SENT";
    PARTIALLY_RECEIVED: "PARTIALLY_RECEIVED";
    RECEIVED: "RECEIVED";
}>;
export type PurchaseOrderStatus = z.infer<typeof purchaseOrderStatusSchema>;
export declare const goodsReceiptItemSchema: z.ZodObject<{
    ingredientId: z.ZodString;
    purchaseOrderItemId: z.ZodOptional<z.ZodString>;
    quantity: z.ZodCoercedNumber<unknown>;
    unitCost: z.ZodCoercedNumber<unknown>;
    batchNumber: z.ZodOptional<z.ZodString>;
    expiryDate: z.ZodOptional<z.ZodCoercedDate<unknown>>;
}, z.core.$strip>;
export type GoodsReceiptItemDto = z.infer<typeof goodsReceiptItemSchema>;
export declare const goodsReceiptSchema: z.ZodObject<{
    supplierId: z.ZodString;
    purchaseOrderId: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        ingredientId: z.ZodString;
        purchaseOrderItemId: z.ZodOptional<z.ZodString>;
        quantity: z.ZodCoercedNumber<unknown>;
        unitCost: z.ZodCoercedNumber<unknown>;
        batchNumber: z.ZodOptional<z.ZodString>;
        expiryDate: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type GoodsReceiptDto = z.infer<typeof goodsReceiptSchema>;
export declare const wasteReasonSchema: z.ZodEnum<{
    OTHER: "OTHER";
    EXPIRED: "EXPIRED";
    SPOILED: "SPOILED";
    DAMAGED: "DAMAGED";
    PREP_ERROR: "PREP_ERROR";
    OVER_PRODUCTION: "OVER_PRODUCTION";
}>;
export type WasteReason = z.infer<typeof wasteReasonSchema>;
export declare const wasteLogSchema: z.ZodObject<{
    ingredientId: z.ZodString;
    quantity: z.ZodCoercedNumber<unknown>;
    reason: z.ZodEnum<{
        OTHER: "OTHER";
        EXPIRED: "EXPIRED";
        SPOILED: "SPOILED";
        DAMAGED: "DAMAGED";
        PREP_ERROR: "PREP_ERROR";
        OVER_PRODUCTION: "OVER_PRODUCTION";
    }>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type WasteLogDto = z.infer<typeof wasteLogSchema>;
export declare const purchaseRequestStatusSchema: z.ZodEnum<{
    APPROVED: "APPROVED";
    REJECTED: "REJECTED";
    DRAFT: "DRAFT";
    PENDING_APPROVAL: "PENDING_APPROVAL";
    CONVERTED: "CONVERTED";
}>;
export type PurchaseRequestStatus = z.infer<typeof purchaseRequestStatusSchema>;
export declare const purchaseRequestItemSchema: z.ZodObject<{
    ingredientId: z.ZodString;
    quantityRequested: z.ZodCoercedNumber<unknown>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type PurchaseRequestItemDto = z.infer<typeof purchaseRequestItemSchema>;
export declare const purchaseRequestSchema: z.ZodObject<{
    notes: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        ingredientId: z.ZodString;
        quantityRequested: z.ZodCoercedNumber<unknown>;
        notes: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type PurchaseRequestDto = z.infer<typeof purchaseRequestSchema>;
export declare const quotationStatusSchema: z.ZodEnum<{
    REJECTED: "REJECTED";
    ACCEPTED: "ACCEPTED";
    DRAFT: "DRAFT";
    RECEIVED: "RECEIVED";
}>;
export type QuotationStatus = z.infer<typeof quotationStatusSchema>;
export declare const supplierQuotationItemSchema: z.ZodObject<{
    ingredientId: z.ZodString;
    quantityQuoted: z.ZodCoercedNumber<unknown>;
    unitPrice: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
export type SupplierQuotationItemDto = z.infer<typeof supplierQuotationItemSchema>;
export declare const supplierQuotationSchema: z.ZodObject<{
    supplierId: z.ZodString;
    validUntil: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    notes: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        ingredientId: z.ZodString;
        quantityQuoted: z.ZodCoercedNumber<unknown>;
        unitPrice: z.ZodCoercedNumber<unknown>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type SupplierQuotationDto = z.infer<typeof supplierQuotationSchema>;
export declare const supplierInvoiceStatusSchema: z.ZodEnum<{
    UNPAID: "UNPAID";
    CANCELLED: "CANCELLED";
    PARTIALLY_PAID: "PARTIALLY_PAID";
    PAID: "PAID";
}>;
export type SupplierInvoiceStatus = z.infer<typeof supplierInvoiceStatusSchema>;
export declare const supplierInvoiceSchema: z.ZodObject<{
    supplierId: z.ZodString;
    purchaseOrderId: z.ZodOptional<z.ZodString>;
    goodsReceiptId: z.ZodOptional<z.ZodString>;
    invoiceNumber: z.ZodString;
    invoiceDate: z.ZodCoercedDate<unknown>;
    dueDate: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    totalAmount: z.ZodCoercedNumber<unknown>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type SupplierInvoiceDto = z.infer<typeof supplierInvoiceSchema>;
export declare const supplierPaymentSchema: z.ZodObject<{
    amount: z.ZodCoercedNumber<unknown>;
    paymentMethod: z.ZodEnum<{
        OTHER: "OTHER";
        CASH: "CASH";
        CARD: "CARD";
        UPI: "UPI";
        WALLET: "WALLET";
        BANK_TRANSFER: "BANK_TRANSFER";
        GIFT_CARD: "GIFT_CARD";
        STORE_CREDIT: "STORE_CREDIT";
    }>;
    reference: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type SupplierPaymentDto = z.infer<typeof supplierPaymentSchema>;
