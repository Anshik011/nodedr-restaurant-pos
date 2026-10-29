"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tableLayoutUpdateSchema = exports.bulkTableCreateSchema = exports.tableUpdateSchema = exports.tableSchema = exports.floorUpdateSchema = exports.floorSchema = exports.tableStatusSchema = void 0;
const zod_1 = require("zod");
exports.tableStatusSchema = zod_1.z.enum([
    "AVAILABLE",
    "OCCUPIED",
    "RESERVED",
    "CLEANING",
    "OUT_OF_SERVICE",
]);
exports.floorSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    sortOrder: zod_1.z.number().int().default(0),
});
exports.floorUpdateSchema = exports.floorSchema.partial();
exports.tableSchema = zod_1.z.object({
    floorId: zod_1.z.string(),
    number: zod_1.z.string().min(1),
    name: zod_1.z.string().optional(),
    capacity: zod_1.z.number().int().positive().default(2),
    posX: zod_1.z.number().default(0),
    posY: zod_1.z.number().default(0),
    width: zod_1.z.number().positive().default(80),
    height: zod_1.z.number().positive().default(80),
    rotation: zod_1.z.number().default(0),
    shape: zod_1.z.enum(["square", "round", "rect"]).default("square"),
    color: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
exports.tableUpdateSchema = exports.tableSchema.omit({ floorId: true }).partial();
exports.bulkTableCreateSchema = zod_1.z.object({
    floorId: zod_1.z.string(),
    numbers: zod_1.z.array(zod_1.z.string().min(1)).min(1).max(100),
    capacity: zod_1.z.number().int().positive().default(2),
    shape: zod_1.z.enum(["square", "round", "rect"]).default("square"),
    color: zod_1.z.string().optional(),
});
exports.tableLayoutUpdateSchema = zod_1.z.object({
    id: zod_1.z.string(),
    posX: zod_1.z.number(),
    posY: zod_1.z.number(),
    width: zod_1.z.number(),
    height: zod_1.z.number(),
    rotation: zod_1.z.number(),
});
