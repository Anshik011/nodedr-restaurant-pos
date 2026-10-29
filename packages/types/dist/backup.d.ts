import { z } from "zod";
export declare const restoreBackupSchema: z.ZodObject<{
    confirm: z.ZodLiteral<"RESTORE">;
}, z.core.$strip>;
export type RestoreBackupDto = z.infer<typeof restoreBackupSchema>;
export declare const setBackupConfigSchema: z.ZodObject<{
    endpoint: z.ZodString;
    bucket: z.ZodString;
    accessKeyId: z.ZodString;
    secretAccessKey: z.ZodString;
    region: z.ZodOptional<z.ZodString>;
    intervalDays: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    retainCount: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type SetBackupConfigDto = z.infer<typeof setBackupConfigSchema>;
