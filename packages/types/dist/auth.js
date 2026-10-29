"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.twoFactorDisableSchema = exports.twoFactorCodeSchema = exports.sessionUserSchema = exports.pinLoginSchema = exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    // Authenticator code or recovery code, once two-factor auth is on.
    totp: zod_1.z.string().trim().min(6).max(20).optional(),
});
exports.registerSchema = zod_1.z.object({
    restaurantName: zod_1.z.string().min(1),
    branchName: zod_1.z.string().min(1).default("Main Branch"),
    ownerName: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
exports.pinLoginSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    pin: zod_1.z.string().min(4).max(8),
});
exports.sessionUserSchema = zod_1.z.object({
    id: zod_1.z.string(),
    restaurantId: zod_1.z.string(),
    name: zod_1.z.string(),
    roleId: zod_1.z.string(),
    roleName: zod_1.z.string(),
    permissions: zod_1.z.array(zod_1.z.string()),
});
exports.twoFactorCodeSchema = zod_1.z.object({ code: zod_1.z.string().trim().min(6).max(20) });
exports.twoFactorDisableSchema = zod_1.z.object({
    password: zod_1.z.string().min(1),
    code: zod_1.z.string().trim().min(6).max(20),
});
