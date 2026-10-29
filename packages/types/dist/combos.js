"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setComboComponentsSchema = exports.comboComponentSchema = void 0;
const zod_1 = require("zod");
exports.comboComponentSchema = zod_1.z.object({
    componentItemId: zod_1.z.string(),
    quantity: zod_1.z.number().int().positive().default(1),
});
exports.setComboComponentsSchema = zod_1.z.object({
    components: zod_1.z.array(exports.comboComponentSchema),
});
