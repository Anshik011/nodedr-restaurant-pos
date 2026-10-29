import { z } from "zod";
export declare const RESTAURANT_NAME_MAX_LENGTH = 40;
export declare const restaurantSettingsSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    legalName: z.ZodOptional<z.ZodString>;
    logoUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    currency: z.ZodOptional<z.ZodString>;
    timezone: z.ZodOptional<z.ZodString>;
    upiVpa: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    upiPayeeName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    loyaltyPointValue: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    loyaltyEarnPerCurrency: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type RestaurantSettingsDto = z.infer<typeof restaurantSettingsSchema>;
export declare const branchSettingsSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    gstNumber: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    taxRegime: z.ZodOptional<z.ZodEnum<{
        CUSTOM: "CUSTOM";
        INDIA_GST: "INDIA_GST";
        US_SALES_TAX: "US_SALES_TAX";
        EU_VAT: "EU_VAT";
        ES_IVA: "ES_IVA";
    }>>;
    taxMode: z.ZodOptional<z.ZodEnum<{
        INCLUSIVE: "INCLUSIVE";
        EXCLUSIVE: "EXCLUSIVE";
    }>>;
    taxLabel: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    taxId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    autoConfirmOrders: z.ZodOptional<z.ZodBoolean>;
    autoConfirmReservations: z.ZodOptional<z.ZodBoolean>;
    kioskDineInEnabled: z.ZodOptional<z.ZodBoolean>;
    kioskTakeawayEnabled: z.ZodOptional<z.ZodBoolean>;
    printerPaperWidthMm: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<58>, z.ZodLiteral<80>]>>;
    printerCodepage: z.ZodOptional<z.ZodEnum<{
        CP437: "CP437";
        CP850: "CP850";
        CP858: "CP858";
        CP1252: "CP1252";
    }>>;
    printerColumns: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    printerConnection: z.ZodOptional<z.ZodEnum<{
        USB: "USB";
        NETWORK: "NETWORK";
    }>>;
    printerHost: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    printerPort: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type BranchSettingsDto = z.infer<typeof branchSettingsSchema>;
