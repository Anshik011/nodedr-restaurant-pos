import { z } from "zod";
export declare const spiceLevelSchema: z.ZodEnum<{
    NONE: "NONE";
    MILD: "MILD";
    MEDIUM: "MEDIUM";
    HOT: "HOT";
    EXTRA_HOT: "EXTRA_HOT";
}>;
export declare const menuCategorySchema: z.ZodObject<{
    name: z.ZodString;
    sortOrder: z.ZodDefault<z.ZodNumber>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    showOnWebsite: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export type MenuCategoryDto = z.infer<typeof menuCategorySchema>;
export declare const modifierSchema: z.ZodObject<{
    name: z.ZodString;
    priceAdjustment: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    taxRatePercent: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    kitchenNote: z.ZodOptional<z.ZodString>;
    isDefault: z.ZodDefault<z.ZodBoolean>;
    sortOrder: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export type ModifierDto = z.infer<typeof modifierSchema>;
export declare const modifierGroupSchema: z.ZodObject<{
    name: z.ZodString;
    minSelect: z.ZodDefault<z.ZodNumber>;
    maxSelect: z.ZodDefault<z.ZodNumber>;
    isRequired: z.ZodDefault<z.ZodBoolean>;
    modifiers: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        priceAdjustment: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        taxRatePercent: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        kitchenNote: z.ZodOptional<z.ZodString>;
        isDefault: z.ZodDefault<z.ZodBoolean>;
        sortOrder: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type ModifierGroupDto = z.infer<typeof modifierGroupSchema>;
export declare const menuItemSchema: z.ZodObject<{
    categoryId: z.ZodString;
    stationId: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    sku: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    imageUrl: z.ZodOptional<z.ZodString>;
    price: z.ZodCoercedNumber<unknown>;
    halfPrice: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    taxRatePercent: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    costPrice: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    prepTimeMinutes: z.ZodOptional<z.ZodNumber>;
    calories: z.ZodOptional<z.ZodNumber>;
    isVeg: z.ZodDefault<z.ZodBoolean>;
    isVegan: z.ZodDefault<z.ZodBoolean>;
    isJain: z.ZodDefault<z.ZodBoolean>;
    isHalal: z.ZodDefault<z.ZodBoolean>;
    isGlutenFree: z.ZodDefault<z.ZodBoolean>;
    spiceLevel: z.ZodDefault<z.ZodEnum<{
        NONE: "NONE";
        MILD: "MILD";
        MEDIUM: "MEDIUM";
        HOT: "HOT";
        EXTRA_HOT: "EXTRA_HOT";
    }>>;
    allergens: z.ZodDefault<z.ZodArray<z.ZodString>>;
    availableFrom: z.ZodOptional<z.ZodString>;
    availableTo: z.ZodOptional<z.ZodString>;
    barcode: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    modifierGroupIds: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type MenuItemDto = z.infer<typeof menuItemSchema>;
