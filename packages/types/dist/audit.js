"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogListQuerySchema = void 0;
const zod_1 = require("zod");
// Query params for GET /v1/audit-logs. `ZodValidationPipe` (backend) only
// binds to `@Body()`, not `@Query()` (see its own comment in
// apps/backend/src/common/pipes/zod-validation.pipe.ts), so this schema is
// parsed manually in the controller with `.safeParse()` instead. Shared here
// so the frontend hook builds a query string the backend actually accepts.
exports.auditLogListQuerySchema = zod_1.z.object({
    entity: zod_1.z.string().min(1).optional(),
    action: zod_1.z.string().min(1).optional(),
    userId: zod_1.z.string().min(1).optional(),
    from: zod_1.z.coerce.date().optional(),
    to: zod_1.z.coerce.date().optional(),
    page: zod_1.z.coerce.number().int().positive().default(1),
    pageSize: zod_1.z.coerce.number().int().positive().max(100).default(20),
});
