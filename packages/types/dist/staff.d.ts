import { z } from "zod";
export declare const createStaffSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
    roleId: z.ZodString;
    branchIds: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type CreateStaffDto = z.infer<typeof createStaffSchema>;
export declare const updateStaffSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    roleId: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    branchIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    password: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UpdateStaffDto = z.infer<typeof updateStaffSchema>;
