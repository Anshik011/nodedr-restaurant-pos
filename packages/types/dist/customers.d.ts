import { z } from "zod";
export declare const customerSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    birthday: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    anniversary: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    allergies: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    marketingOptOut: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type CustomerDto = z.infer<typeof customerSchema>;
