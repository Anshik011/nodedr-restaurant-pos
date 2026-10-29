import { z } from "zod";
export declare const auditLogListQuerySchema: z.ZodObject<{
    entity: z.ZodOptional<z.ZodString>;
    action: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
    from: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    to: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    pageSize: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type AuditLogListQueryDto = z.infer<typeof auditLogListQuerySchema>;
