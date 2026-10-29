"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payrollRunSchema = exports.staffPaySchema = exports.leaveDecisionSchema = exports.leaveRequestSchema = exports.leaveTypeSchema = exports.shiftSchema = void 0;
const zod_1 = require("zod");
const isoDate = zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");
exports.shiftSchema = zod_1.z
    .object({
    userId: zod_1.z.string().min(1),
    startsAt: zod_1.z.string().datetime(),
    endsAt: zod_1.z.string().datetime(),
    note: zod_1.z.string().max(200).optional(),
})
    .refine((v) => new Date(v.endsAt) > new Date(v.startsAt), {
    message: "A shift must end after it starts",
    path: ["endsAt"],
});
exports.leaveTypeSchema = zod_1.z.enum(["ANNUAL", "SICK", "UNPAID", "OTHER"]);
exports.leaveRequestSchema = zod_1.z
    .object({
    branchId: zod_1.z.string().min(1),
    type: exports.leaveTypeSchema.default("ANNUAL"),
    startDate: isoDate,
    endDate: isoDate,
    reason: zod_1.z.string().max(300).optional(),
})
    .refine((v) => v.endDate >= v.startDate, {
    message: "End date cannot be before start date",
    path: ["endDate"],
});
exports.leaveDecisionSchema = zod_1.z.object({
    status: zod_1.z.enum(["APPROVED", "REJECTED"]),
});
exports.staffPaySchema = zod_1.z.object({
    payType: zod_1.z.enum(["MONTHLY", "HOURLY"]),
    rate: zod_1.z.coerce.number().min(0),
});
exports.payrollRunSchema = zod_1.z
    .object({ periodStart: isoDate, periodEnd: isoDate })
    .refine((v) => v.periodEnd >= v.periodStart, {
    message: "Period end cannot be before start",
    path: ["periodEnd"],
});
