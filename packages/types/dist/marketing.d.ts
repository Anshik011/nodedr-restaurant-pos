import { z } from "zod";
export declare const discountKindSchema: z.ZodEnum<{
    PERCENT: "PERCENT";
    FLAT: "FLAT";
}>;
export declare const couponSchema: z.ZodObject<{
    code: z.ZodString;
    kind: z.ZodEnum<{
        PERCENT: "PERCENT";
        FLAT: "FLAT";
    }>;
    value: z.ZodCoercedNumber<unknown>;
    minOrderAmount: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    maxDiscount: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    validFrom: z.ZodOptional<z.ZodString>;
    validUntil: z.ZodOptional<z.ZodString>;
    usageLimit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export type CouponDto = z.infer<typeof couponSchema>;
export declare const promotionSchema: z.ZodObject<{
    name: z.ZodString;
    kind: z.ZodEnum<{
        PERCENT: "PERCENT";
        FLAT: "FLAT";
    }>;
    value: z.ZodCoercedNumber<unknown>;
    daysOfWeek: z.ZodArray<z.ZodNumber>;
    startTime: z.ZodString;
    endTime: z.ZodString;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export type PromotionDto = z.infer<typeof promotionSchema>;
export declare const campaignSchema: z.ZodObject<{
    name: z.ZodString;
    channel: z.ZodEnum<{
        SMS: "SMS";
        EMAIL: "EMAIL";
        WHATSAPP: "WHATSAPP";
    }>;
    segment: z.ZodDefault<z.ZodEnum<{
        ALL: "ALL";
        LOYAL: "LOYAL";
        LAPSED: "LAPSED";
        BIRTHDAY_MONTH: "BIRTHDAY_MONTH";
    }>>;
    message: z.ZodString;
}, z.core.$strip>;
export type CampaignDto = z.infer<typeof campaignSchema>;
export declare const equipmentSchema: z.ZodObject<{
    name: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    serviceIntervalDays: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    lastServicedAt: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type EquipmentDto = z.infer<typeof equipmentSchema>;
export declare const serviceLogSchema: z.ZodObject<{
    servicedAt: z.ZodString;
    cost: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    note: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ServiceLogDto = z.infer<typeof serviceLogSchema>;
export declare const documentSchema: z.ZodObject<{
    title: z.ZodString;
    category: z.ZodDefault<z.ZodEnum<{
        OTHER: "OTHER";
        RECIPE: "RECIPE";
        SOP: "SOP";
        CONTRACT: "CONTRACT";
        PURCHASE: "PURCHASE";
    }>>;
    body: z.ZodString;
}, z.core.$strip>;
export type DocumentDto = z.infer<typeof documentSchema>;
export declare const documentUpdateSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        OTHER: "OTHER";
        RECIPE: "RECIPE";
        SOP: "SOP";
        CONTRACT: "CONTRACT";
        PURCHASE: "PURCHASE";
    }>>>;
    body: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const couponCodeSchema: z.ZodString;
