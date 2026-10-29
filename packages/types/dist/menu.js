"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuItemSchema = exports.modifierGroupSchema = exports.modifierSchema = exports.menuCategorySchema = exports.spiceLevelSchema = void 0;
const zod_1 = require("zod");
exports.spiceLevelSchema = zod_1.z.enum(["NONE", "MILD", "MEDIUM", "HOT", "EXTRA_HOT"]);
exports.menuCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    sortOrder: zod_1.z.number().int().default(0),
    isActive: zod_1.z.boolean().default(true),
    showOnWebsite: zod_1.z.boolean().default(true),
});
exports.modifierSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    priceAdjustment: zod_1.z.coerce.number().default(0),
    taxRatePercent: zod_1.z.coerce.number().optional(),
    kitchenNote: zod_1.z.string().optional(),
    isDefault: zod_1.z.boolean().default(false),
    sortOrder: zod_1.z.number().int().default(0),
});
exports.modifierGroupSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    minSelect: zod_1.z.number().int().min(0).default(0),
    maxSelect: zod_1.z.number().int().min(1).default(1),
    isRequired: zod_1.z.boolean().default(false),
    modifiers: zod_1.z.array(exports.modifierSchema).default([]),
});
exports.menuItemSchema = zod_1.z.object({
    categoryId: zod_1.z.string(),
    stationId: zod_1.z.string().optional(),
    name: zod_1.z.string().min(1),
    sku: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    imageUrl: zod_1.z.string().optional(),
    price: zod_1.z.coerce.number().nonnegative(),
    // Set to enable the Half / Full / Custom portion picker; `price` is the full portion.
    halfPrice: zod_1.z.number().nonnegative().nullable().optional(),
    taxRatePercent: zod_1.z.coerce.number().min(0).max(100).default(0),
    costPrice: zod_1.z.coerce.number().nonnegative().optional(),
    prepTimeMinutes: zod_1.z.number().int().nonnegative().optional(),
    calories: zod_1.z.number().int().nonnegative().optional(),
    isVeg: zod_1.z.boolean().default(true),
    isVegan: zod_1.z.boolean().default(false),
    isJain: zod_1.z.boolean().default(false),
    isHalal: zod_1.z.boolean().default(false),
    isGlutenFree: zod_1.z.boolean().default(false),
    spiceLevel: exports.spiceLevelSchema.default("NONE"),
    allergens: zod_1.z.array(zod_1.z.string()).default([]),
    availableFrom: zod_1.z.string().regex(/^\d{2}:\d{2}$/).optional(),
    availableTo: zod_1.z.string().regex(/^\d{2}:\d{2}$/).optional(),
    barcode: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().default(true),
    modifierGroupIds: zod_1.z.array(zod_1.z.string()).default([]),
});
