import { z } from "zod";
export declare const shiftSchema: z.ZodObject<{
    userId: z.ZodString;
    startsAt: z.ZodString;
    endsAt: z.ZodString;
    note: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ShiftDto = z.infer<typeof shiftSchema>;
export declare const leaveTypeSchema: z.ZodEnum<{
    ANNUAL: "ANNUAL";
    SICK: "SICK";
    UNPAID: "UNPAID";
    OTHER: "OTHER";
}>;
export declare const leaveRequestSchema: z.ZodObject<{
    branchId: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<{
        ANNUAL: "ANNUAL";
        SICK: "SICK";
        UNPAID: "UNPAID";
        OTHER: "OTHER";
    }>>;
    startDate: z.ZodString;
    endDate: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type LeaveRequestDto = z.infer<typeof leaveRequestSchema>;
export declare const leaveDecisionSchema: z.ZodObject<{
    status: z.ZodEnum<{
        APPROVED: "APPROVED";
        REJECTED: "REJECTED";
    }>;
}, z.core.$strip>;
export declare const staffPaySchema: z.ZodObject<{
    payType: z.ZodEnum<{
        MONTHLY: "MONTHLY";
        HOURLY: "HOURLY";
    }>;
    rate: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
export type StaffPayDto = z.infer<typeof staffPaySchema>;
export declare const payrollRunSchema: z.ZodObject<{
    periodStart: z.ZodString;
    periodEnd: z.ZodString;
}, z.core.$strip>;
export type PayrollRunDto = z.infer<typeof payrollRunSchema>;
