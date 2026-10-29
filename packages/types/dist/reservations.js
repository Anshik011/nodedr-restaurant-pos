"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seatWaitlistEntrySchema = exports.createWaitlistEntrySchema = exports.waitlistStatusSchema = exports.updateReservationStatusSchema = exports.createReservationSchema = exports.reservationStatusSchema = void 0;
const zod_1 = require("zod");
exports.reservationStatusSchema = zod_1.z.enum([
    "RESERVED",
    "CONFIRMED",
    "ARRIVED",
    "COMPLETED",
    "CANCELLED",
    "NO_SHOW",
]);
exports.createReservationSchema = zod_1.z.object({
    customerName: zod_1.z.string().min(1),
    phone: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    guestCount: zod_1.z.number().int().positive(),
    reservedAt: zod_1.z.coerce.date(),
    durationMinutes: zod_1.z.number().int().positive().default(90),
    tableId: zod_1.z.string().optional(),
    specialRequests: zod_1.z.string().optional(),
    deposit: zod_1.z.coerce.number().nonnegative().optional(),
});
exports.updateReservationStatusSchema = zod_1.z.object({
    status: exports.reservationStatusSchema,
});
exports.waitlistStatusSchema = zod_1.z.enum(["WAITING", "SEATED", "CANCELLED"]);
exports.createWaitlistEntrySchema = zod_1.z.object({
    customerName: zod_1.z.string().min(1),
    phone: zod_1.z.string().optional(),
    partySize: zod_1.z.number().int().positive(),
    quotedWaitMinutes: zod_1.z.number().int().nonnegative().optional(),
    notes: zod_1.z.string().optional(),
});
exports.seatWaitlistEntrySchema = zod_1.z.object({
    tableId: zod_1.z.string(),
});
