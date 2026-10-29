"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIntegrationReservationSchema = exports.createIntegrationOrderSchema = exports.integrationOrderTypeSchema = exports.integrationOrderItemSchema = exports.createStaffApiKeySchema = exports.createIntegrationApiKeySchema = exports.integrationScopeSchema = exports.INTEGRATION_SCOPES = void 0;
const zod_1 = require("zod");
const orders_1 = require("./orders");
// Scopes an IntegrationApiKey (see schema.prisma) can hold — what an
// external website's own backend is allowed to do once authenticated with
// that key. Deliberately separate from the staff PermissionKey list
// (permissions.ts): these are not tied to any staff member or role, they
// describe what an external system integration is allowed to do.
exports.INTEGRATION_SCOPES = [
    { key: "locations:read", label: "View locations", description: "List active branches and their basic info." },
    { key: "menu:read", label: "View menu", description: "Read a location's menu, categories, and prices." },
    { key: "orders:write", label: "Create orders", description: "Place a new takeaway/delivery order for a location." },
    { key: "orders:read", label: "View order status", description: "Look up an order's current status." },
    {
        key: "reservations:write",
        label: "Book tables",
        description: "Create a new table reservation for a location.",
    },
    {
        key: "reservations:read",
        label: "View reservation status",
        description: "Look up a reservation's current status.",
    },
];
exports.integrationScopeSchema = zod_1.z.enum(exports.INTEGRATION_SCOPES.map((s) => s.key));
exports.createIntegrationApiKeySchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1).max(80),
    branchId: zod_1.z.string().optional(),
    scopes: zod_1.z.array(exports.integrationScopeSchema).min(1),
});
exports.createStaffApiKeySchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1).max(80),
});
// Public REST API request/response shapes (docs/integrations-api.md is the
// human-readable version of these).
exports.integrationOrderItemSchema = zod_1.z.object({
    menuItemId: zod_1.z.string(),
    quantity: zod_1.z.number().int().positive(),
    modifierIds: zod_1.z.array(zod_1.z.string()).default([]),
    kitchenNote: zod_1.z.string().optional(),
});
exports.integrationOrderTypeSchema = zod_1.z.enum(["TAKEAWAY", "DELIVERY"]);
exports.createIntegrationOrderSchema = zod_1.z.object({
    type: exports.integrationOrderTypeSchema.default("TAKEAWAY"),
    customerName: zod_1.z.string().trim().min(1).max(80),
    customerPhone: zod_1.z.string().trim().min(1).max(30),
    notes: zod_1.z.string().optional(),
    // Needed for DELIVERY once the location has delivery zones configured.
    delivery: orders_1.deliveryInfoSchema.optional(),
    // Pre-order: ISO time at least 10 minutes ahead.
    scheduledFor: zod_1.z.string().datetime().optional(),
    items: zod_1.z.array(exports.integrationOrderItemSchema).min(1),
});
exports.createIntegrationReservationSchema = zod_1.z.object({
    customerName: zod_1.z.string().trim().min(1).max(80),
    phone: zod_1.z.string().trim().min(1).max(30),
    email: zod_1.z.string().email().optional(),
    guestCount: zod_1.z.number().int().positive(),
    reservedAt: zod_1.z.coerce.date(),
    durationMinutes: zod_1.z.number().int().positive().default(90),
    specialRequests: zod_1.z.string().optional(),
});
