import { z } from "zod";
export declare const reservationStatusSchema: z.ZodEnum<{
    RESERVED: "RESERVED";
    CANCELLED: "CANCELLED";
    CONFIRMED: "CONFIRMED";
    ARRIVED: "ARRIVED";
    COMPLETED: "COMPLETED";
    NO_SHOW: "NO_SHOW";
}>;
export type ReservationStatusDto = z.infer<typeof reservationStatusSchema>;
export declare const createReservationSchema: z.ZodObject<{
    customerName: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    guestCount: z.ZodNumber;
    reservedAt: z.ZodCoercedDate<unknown>;
    durationMinutes: z.ZodDefault<z.ZodNumber>;
    tableId: z.ZodOptional<z.ZodString>;
    specialRequests: z.ZodOptional<z.ZodString>;
    deposit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type CreateReservationDto = z.infer<typeof createReservationSchema>;
export declare const updateReservationStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        RESERVED: "RESERVED";
        CANCELLED: "CANCELLED";
        CONFIRMED: "CONFIRMED";
        ARRIVED: "ARRIVED";
        COMPLETED: "COMPLETED";
        NO_SHOW: "NO_SHOW";
    }>;
}, z.core.$strip>;
export type UpdateReservationStatusDto = z.infer<typeof updateReservationStatusSchema>;
export declare const waitlistStatusSchema: z.ZodEnum<{
    CANCELLED: "CANCELLED";
    WAITING: "WAITING";
    SEATED: "SEATED";
}>;
export type WaitlistStatusDto = z.infer<typeof waitlistStatusSchema>;
export declare const createWaitlistEntrySchema: z.ZodObject<{
    customerName: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    partySize: z.ZodNumber;
    quotedWaitMinutes: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateWaitlistEntryDto = z.infer<typeof createWaitlistEntrySchema>;
export declare const seatWaitlistEntrySchema: z.ZodObject<{
    tableId: z.ZodString;
}, z.core.$strip>;
export type SeatWaitlistEntryDto = z.infer<typeof seatWaitlistEntrySchema>;
