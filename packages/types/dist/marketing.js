"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.couponCodeSchema = exports.documentUpdateSchema = exports.documentSchema = exports.serviceLogSchema = exports.equipmentSchema = exports.campaignSchema = exports.promotionSchema = exports.couponSchema = exports.discountKindSchema = void 0;
const zod_1 = require("zod");
exports.discountKindSchema = zod_1.z.enum(["PERCENT", "FLAT"]);
const discountValue = (kind, value) => kind === "FLAT" || value <= 100;
exports.couponSchema = zod_1.z
    .object({
    code: zod_1.z
        .string()
        .trim()
        .min(3)
        .max(24)
        .regex(/^[A-Za-z0-9_-]+$/, "Letters, numbers, - and _ only"),
    kind: exports.discountKindSchema,
    value: zod_1.z.coerce.number().positive(),
    minOrderAmount: zod_1.z.coerce.number().min(0).default(0),
    maxDiscount: zod_1.z.coerce.number().positive().optional(),
    validFrom: zod_1.z.string().datetime().optional(),
    validUntil: zod_1.z.string().datetime().optional(),
    usageLimit: zod_1.z.coerce.number().int().positive().optional(),
    isActive: zod_1.z.boolean().default(true),
})
    .refine((v) => discountValue(v.kind, v.value), {
    message: "A percentage discount cannot exceed 100",
    path: ["value"],
});
const time = zod_1.z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM");
exports.promotionSchema = zod_1.z
    .object({
    name: zod_1.z.string().trim().min(1).max(60),
    kind: exports.discountKindSchema,
    value: zod_1.z.coerce.number().positive(),
    daysOfWeek: zod_1.z.array(zod_1.z.number().int().min(0).max(6)).min(1),
    startTime: time,
    endTime: time,
    isActive: zod_1.z.boolean().default(true),
})
    .refine((v) => discountValue(v.kind, v.value), {
    message: "A percentage discount cannot exceed 100",
    path: ["value"],
})
    .refine((v) => v.startTime < v.endTime, {
    message: "End time must be after start time",
    path: ["endTime"],
});
exports.campaignSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1).max(80),
    channel: zod_1.z.enum(["SMS", "EMAIL", "WHATSAPP"]),
    segment: zod_1.z.enum(["ALL", "LOYAL", "LAPSED", "BIRTHDAY_MONTH"]).default("ALL"),
    message: zod_1.z.string().trim().min(1).max(600),
});
exports.equipmentSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1).max(80),
    location: zod_1.z.string().trim().max(80).optional(),
    serviceIntervalDays: zod_1.z.coerce.number().int().positive().optional(),
    lastServicedAt: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    notes: zod_1.z.string().max(300).optional(),
});
exports.serviceLogSchema = zod_1.z.object({
    servicedAt: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    cost: zod_1.z.coerce.number().min(0).optional(),
    note: zod_1.z.string().max(300).optional(),
});
exports.documentSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(1).max(120),
    category: zod_1.z.enum(["SOP", "CONTRACT", "RECIPE", "PURCHASE", "OTHER"]).default("SOP"),
    body: zod_1.z.string().min(1).max(50_000),
});
exports.documentUpdateSchema = exports.documentSchema.partial();
// checkout may carry a coupon code
exports.couponCodeSchema = zod_1.z.string().trim().min(3).max(24);
