"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cashClosingSchema = exports.expenseSchema = void 0;
const zod_1 = require("zod");
const isoDate = zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");
exports.expenseSchema = zod_1.z.object({
    spentOn: isoDate,
    category: zod_1.z.string().trim().min(1).max(60),
    amount: zod_1.z.coerce.number().positive(),
    note: zod_1.z.string().max(300).optional(),
    paidFromCash: zod_1.z.boolean().default(false),
});
exports.cashClosingSchema = zod_1.z.object({
    businessDate: isoDate,
    openingFloat: zod_1.z.coerce.number().min(0).default(0),
    countedCash: zod_1.z.coerce.number().min(0),
    note: zod_1.z.string().max(300).optional(),
});
