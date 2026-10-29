"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setBackupConfigSchema = exports.restoreBackupSchema = void 0;
const zod_1 = require("zod");
// Literal-string confirm, matching zulivio's restore safety gate exactly —
// a deliberate speed bump before the single most destructive action in
// this app (drops and recreates the entire shared Postgres instance).
exports.restoreBackupSchema = zod_1.z.object({
    confirm: zod_1.z.literal("RESTORE"),
});
// Not @IsUrl-style strict URL validation on `endpoint` — deliberately a
// loose http(s):// prefix check (same reasoning as zulivio's
// SetBackupConfigDto): a real S3-compatible endpoint can be a bare IP with
// a port, and the actual validation that matters is the live connectivity
// probe `BackupService.setConfig()` performs before persisting anything.
exports.setBackupConfigSchema = zod_1.z.object({
    endpoint: zod_1.z
        .string()
        .min(1)
        .regex(/^https?:\/\/.+/, "Endpoint must start with http:// or https://"),
    bucket: zod_1.z.string().min(1),
    accessKeyId: zod_1.z.string().min(1),
    secretAccessKey: zod_1.z.string().min(1),
    region: zod_1.z.string().min(1).optional(),
    intervalDays: zod_1.z.coerce.number().int().min(1).max(30).optional(),
    retainCount: zod_1.z.coerce.number().int().min(1).max(10).optional(),
});
