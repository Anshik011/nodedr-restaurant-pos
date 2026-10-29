import { z } from "zod";
export declare const setPrioritySchema: z.ZodObject<{
    isPriority: z.ZodBoolean;
}, z.core.$strip>;
export type SetPriorityDto = z.infer<typeof setPrioritySchema>;
