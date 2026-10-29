import { z } from "zod";
export declare const tableStatusSchema: z.ZodEnum<{
    AVAILABLE: "AVAILABLE";
    OCCUPIED: "OCCUPIED";
    RESERVED: "RESERVED";
    CLEANING: "CLEANING";
    OUT_OF_SERVICE: "OUT_OF_SERVICE";
}>;
export type TableStatusDto = z.infer<typeof tableStatusSchema>;
export declare const floorSchema: z.ZodObject<{
    name: z.ZodString;
    sortOrder: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export type FloorDto = z.infer<typeof floorSchema>;
export declare const floorUpdateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, z.core.$strip>;
export type FloorUpdateDto = z.infer<typeof floorUpdateSchema>;
export declare const tableSchema: z.ZodObject<{
    floorId: z.ZodString;
    number: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    capacity: z.ZodDefault<z.ZodNumber>;
    posX: z.ZodDefault<z.ZodNumber>;
    posY: z.ZodDefault<z.ZodNumber>;
    width: z.ZodDefault<z.ZodNumber>;
    height: z.ZodDefault<z.ZodNumber>;
    rotation: z.ZodDefault<z.ZodNumber>;
    shape: z.ZodDefault<z.ZodEnum<{
        square: "square";
        round: "round";
        rect: "rect";
    }>>;
    color: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type TableDto = z.infer<typeof tableSchema>;
export declare const tableUpdateSchema: z.ZodObject<{
    number: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    capacity: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    posX: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    posY: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    width: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    height: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    rotation: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    shape: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        square: "square";
        round: "round";
        rect: "rect";
    }>>>;
    color: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type TableUpdateDto = z.infer<typeof tableUpdateSchema>;
export declare const bulkTableCreateSchema: z.ZodObject<{
    floorId: z.ZodString;
    numbers: z.ZodArray<z.ZodString>;
    capacity: z.ZodDefault<z.ZodNumber>;
    shape: z.ZodDefault<z.ZodEnum<{
        square: "square";
        round: "round";
        rect: "rect";
    }>>;
    color: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type BulkTableCreateDto = z.infer<typeof bulkTableCreateSchema>;
export declare const tableLayoutUpdateSchema: z.ZodObject<{
    id: z.ZodString;
    posX: z.ZodNumber;
    posY: z.ZodNumber;
    width: z.ZodNumber;
    height: z.ZodNumber;
    rotation: z.ZodNumber;
}, z.core.$strip>;
export type TableLayoutUpdateDto = z.infer<typeof tableLayoutUpdateSchema>;
