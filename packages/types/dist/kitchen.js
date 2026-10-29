"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPrioritySchema = void 0;
const zod_1 = require("zod");
exports.setPrioritySchema = zod_1.z.object({
    isPriority: zod_1.z.boolean(),
});
