import { z } from "zod";
export declare const comboComponentSchema: z.ZodObject<{
    componentItemId: z.ZodString;
    quantity: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export type ComboComponentDto = z.infer<typeof comboComponentSchema>;
export declare const setComboComponentsSchema: z.ZodObject<{
    components: z.ZodArray<z.ZodObject<{
        componentItemId: z.ZodString;
        quantity: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type SetComboComponentsDto = z.infer<typeof setComboComponentsSchema>;
