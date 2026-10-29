import { z } from "zod";
export declare const notificationListQuerySchema: z.ZodObject<{
    unreadOnly: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    pageSize: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type NotificationListQueryDto = z.infer<typeof notificationListQuerySchema>;
