"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationListQuerySchema = void 0;
const zod_1 = require("zod");
// Query params for GET /v1/notifications. Same reasoning as
// `auditLogListQuerySchema` (audit.ts): `ZodValidationPipe` only binds to
// `@Body()`, not `@Query()`, so this is parsed manually with `.safeParse()`
// in the controller — shared here so the frontend hook builds a query
// string the backend actually accepts.
exports.notificationListQuerySchema = zod_1.z.object({
    unreadOnly: zod_1.z.coerce.boolean().optional(),
    page: zod_1.z.coerce.number().int().positive().default(1),
    pageSize: zod_1.z.coerce.number().int().positive().max(100).default(20),
});
