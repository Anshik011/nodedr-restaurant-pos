"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStaffSchema = exports.createStaffSchema = void 0;
const zod_1 = require("zod");
exports.createStaffSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional(),
    password: zod_1.z.string().min(8),
    roleId: zod_1.z.string().min(1),
    branchIds: zod_1.z.array(zod_1.z.string()).min(1),
});
exports.updateStaffSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional(),
    roleId: zod_1.z.string().min(1).optional(),
    isActive: zod_1.z.boolean().optional(),
    branchIds: zod_1.z.array(zod_1.z.string()).optional(),
    password: zod_1.z.string().min(8).optional(),
});
