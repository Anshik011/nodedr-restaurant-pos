"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRoleSchema = exports.createRoleSchema = void 0;
const zod_1 = require("zod");
exports.createRoleSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    label: zod_1.z.string().min(1),
    permissionKeys: zod_1.z.array(zod_1.z.string().min(1)).default([]),
});
// `name` is deliberately absent — a role's name is immutable once created
// (system or custom); only its display label and permission grants can
// change via PATCH.
exports.updateRoleSchema = zod_1.z.object({
    label: zod_1.z.string().min(1).optional(),
    permissionKeys: zod_1.z.array(zod_1.z.string().min(1)).optional(),
});
