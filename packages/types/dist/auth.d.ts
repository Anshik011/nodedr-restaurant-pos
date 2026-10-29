import { z } from "zod";
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    totp: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type LoginDto = z.infer<typeof loginSchema>;
export declare const registerSchema: z.ZodObject<{
    restaurantName: z.ZodString;
    branchName: z.ZodDefault<z.ZodString>;
    ownerName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type RegisterDto = z.infer<typeof registerSchema>;
export declare const pinLoginSchema: z.ZodObject<{
    userId: z.ZodString;
    pin: z.ZodString;
}, z.core.$strip>;
export type PinLoginDto = z.infer<typeof pinLoginSchema>;
export declare const sessionUserSchema: z.ZodObject<{
    id: z.ZodString;
    restaurantId: z.ZodString;
    name: z.ZodString;
    roleId: z.ZodString;
    roleName: z.ZodString;
    permissions: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type SessionUser = z.infer<typeof sessionUserSchema>;
export declare const twoFactorCodeSchema: z.ZodObject<{
    code: z.ZodString;
}, z.core.$strip>;
export declare const twoFactorDisableSchema: z.ZodObject<{
    password: z.ZodString;
    code: z.ZodString;
}, z.core.$strip>;
