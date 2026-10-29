import { z } from "zod";
export declare const issueGiftCardSchema: z.ZodObject<{
    initialValue: z.ZodCoercedNumber<unknown>;
    customerId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type IssueGiftCardDto = z.infer<typeof issueGiftCardSchema>;
