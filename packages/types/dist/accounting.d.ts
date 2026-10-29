import { z } from "zod";
export declare const expenseSchema: z.ZodObject<{
    spentOn: z.ZodString;
    category: z.ZodString;
    amount: z.ZodCoercedNumber<unknown>;
    note: z.ZodOptional<z.ZodString>;
    paidFromCash: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export type ExpenseDto = z.infer<typeof expenseSchema>;
export declare const cashClosingSchema: z.ZodObject<{
    businessDate: z.ZodString;
    openingFloat: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    countedCash: z.ZodCoercedNumber<unknown>;
    note: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CashClosingDto = z.infer<typeof cashClosingSchema>;
