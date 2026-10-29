"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueGiftCardSchema = void 0;
const zod_1 = require("zod");
exports.issueGiftCardSchema = zod_1.z.object({
    initialValue: zod_1.z.coerce.number().positive(),
    customerId: zod_1.z.string().optional(),
});
