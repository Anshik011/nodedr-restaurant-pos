import { z } from "zod";
export declare const createRoleSchema: z.ZodObject<{
    name: z.ZodString;
    label: z.ZodString;
    permissionKeys: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type CreateRoleDto = z.infer<typeof createRoleSchema>;
export declare const updateRoleSchema: z.ZodObject<{
    label: z.ZodOptional<z.ZodString>;
    permissionKeys: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type UpdateRoleDto = z.infer<typeof updateRoleSchema>;
