"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerSchema = void 0;
const zod_1 = require("zod");
exports.customerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    phone: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    address: zod_1.z.string().optional(),
    birthday: zod_1.z.coerce.date().optional(),
    anniversary: zod_1.z.coerce.date().optional(),
    allergies: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    marketingOptOut: zod_1.z.boolean().optional(),
});
