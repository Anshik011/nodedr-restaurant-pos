"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpToolsBuilder = void 0;
const common_1 = require("@nestjs/common");
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const types_1 = require("@nodedr-restaurant/types");
const prisma_service_1 = require("../prisma/prisma.service");
const branch_access_service_1 = require("../common/services/branch-access.service");
const orders_service_1 = require("../modules/orders/orders.service");
const reservations_service_1 = require("../modules/reservations/reservations.service");
const dashboard_service_1 = require("../modules/dashboard/dashboard.service");
const menu_service_1 = require("../modules/menu/menu.service");
const delivery_service_1 = require("../modules/delivery/delivery.service");
const accounting_service_1 = require("../modules/accounting/accounting.service");
const marketing_service_1 = require("../modules/marketing/marketing.service");
const operations_service_1 = require("../modules/operations/operations.service");
const reports_service_1 = require("../modules/reports/reports.service");
const hr_service_1 = require("../modules/hr/hr.service");
const attendance_service_1 = require("../modules/attendance/attendance.service");
const tables_service_1 = require("../modules/tables/tables.service");
const SPICE_LEVEL_VALUES = [
    'NONE',
    'MILD',
    'MEDIUM',
    'HOT',
    'EXTRA_HOT',
];
const TABLE_SHAPE_VALUES = ['square', 'round', 'rect'];
const TABLE_STATUS_VALUES = [
    'AVAILABLE',
    'OCCUPIED',
    'RESERVED',
    'CLEANING',
    'OUT_OF_SERVICE',
];
const PAYMENT_METHOD_VALUES = [
    'CASH',
    'CARD',
    'UPI',
    'WALLET',
    'BANK_TRANSFER',
    'GIFT_CARD',
    'STORE_CREDIT',
    'OTHER',
];
const RESERVATION_STATUS_VALUES = [
    'RESERVED',
    'CONFIRMED',
    'ARRIVED',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW',
];
function isReservationStatus(value) {
    return RESERVATION_STATUS_VALUES.includes(value);
}
class Args {
    raw;
    constructor(raw) {
        this.raw = raw;
    }
    string(key) {
        const value = this.raw[key];
        if (typeof value !== 'string' || value.length === 0)
            throw new Error(`"${key}" is required and must be a string`);
        return value;
    }
    optionalString(key) {
        const value = this.raw[key];
        if (value === undefined)
            return undefined;
        if (typeof value !== 'string')
            throw new Error(`"${key}" must be a string`);
        return value;
    }
    number(key) {
        const value = this.raw[key];
        if (typeof value !== 'number' || !Number.isFinite(value))
            throw new Error(`"${key}" is required and must be a number`);
        return value;
    }
    optionalNumber(key) {
        const value = this.raw[key];
        if (value === undefined)
            return undefined;
        if (typeof value !== 'number' || !Number.isFinite(value))
            throw new Error(`"${key}" must be a number`);
        return value;
    }
    optionalBoolean(key) {
        const value = this.raw[key];
        if (value === undefined)
            return undefined;
        if (typeof value !== 'boolean')
            throw new Error(`"${key}" must be a boolean`);
        return value;
    }
    stringArray(key) {
        const value = this.raw[key];
        if (!Array.isArray(value) || value.length === 0)
            throw new Error(`"${key}" is required and must be a non-empty array of strings`);
        return value.map((v, i) => {
            if (typeof v !== 'string' || !v.trim())
                throw new Error(`${key}[${i}] must be a non-empty string`);
            return v;
        });
    }
    items(key) {
        const value = this.raw[key];
        if (!Array.isArray(value) || value.length === 0)
            throw new Error(`"${key}" is required and must be a non-empty array`);
        return value.map((raw, i) => {
            const item = raw;
            if (typeof item.menuItemId !== 'string' || !item.menuItemId) {
                throw new Error(`${key}[${i}].menuItemId is required and must be a string`);
            }
            if (typeof item.quantity !== 'number' || item.quantity <= 0) {
                throw new Error(`${key}[${i}].quantity is required and must be a positive number`);
            }
            return {
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                modifierIds: Array.isArray(item.modifierIds)
                    ? item.modifierIds
                    : [],
                kitchenNote: typeof item.kitchenNote === 'string' ? item.kitchenNote : undefined,
            };
        });
    }
}
function json(data) {
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}
function errorResult(err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
        content: [{ type: 'text', text: `Error: ${message}` }],
        isError: true,
    };
}
let McpToolsBuilder = class McpToolsBuilder {
    prisma;
    branchAccess;
    orders;
    reservations;
    dashboard;
    menu;
    tables;
    attendance;
    delivery;
    hr;
    accounting;
    reports;
    marketing;
    operations;
    constructor(prisma, branchAccess, orders, reservations, dashboard, menu, tables, attendance, delivery, hr, accounting, reports, marketing, operations) {
        this.prisma = prisma;
        this.branchAccess = branchAccess;
        this.orders = orders;
        this.reservations = reservations;
        this.dashboard = dashboard;
        this.menu = menu;
        this.tables = tables;
        this.attendance = attendance;
        this.delivery = delivery;
        this.hr = hr;
        this.accounting = accounting;
        this.reports = reports;
        this.marketing = marketing;
        this.operations = operations;
    }
    build(actor) {
        const server = new mcp_js_1.McpServer({ name: 'orderrestro', version: '1.0.0' }, { capabilities: { tools: {} } });
        const tools = this.toolDefs(actor);
        server.server.setRequestHandler(types_js_1.ListToolsRequestSchema, () => ({
            tools: tools.map((t) => ({
                name: t.name,
                title: t.title,
                description: t.description,
                inputSchema: t.inputSchema,
                annotations: { readOnlyHint: t.readOnly },
            })),
        }));
        server.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            const tool = tools.find((t) => t.name === request.params.name);
            if (!tool)
                return errorResult(new Error(`Unknown tool "${request.params.name}"`));
            if (tool.requiredPermission &&
                !(0, types_1.permissionSatisfied)(actor.permissions, tool.requiredPermission)) {
                return errorResult(new Error(`Missing permission: ${tool.requiredPermission}`));
            }
            try {
                return await tool.handler(new Args(request.params.arguments ?? {}));
            }
            catch (err) {
                return errorResult(err);
            }
        });
        return server;
    }
    async assertBranch(actor, branchId) {
        await this.branchAccess.assertAccess(actor.restaurantId, branchId);
    }
    toolDefs(actor) {
        return [
            {
                name: 'list_locations',
                title: 'List locations',
                description: "List the caller's restaurant's active locations (branches) — id, name, address, phone.",
                inputSchema: { type: 'object' },
                readOnly: true,
                handler: async () => json(await this.prisma.branch.findMany({
                    where: { restaurantId: actor.restaurantId, isActive: true },
                    select: { id: true, name: true, address: true, phone: true },
                    orderBy: { name: 'asc' },
                })),
            },
            {
                name: 'dashboard_summary',
                title: 'Dashboard summary',
                description: "Today's sales/orders summary for one location.",
                inputSchema: {
                    type: 'object',
                    properties: { branchId: { type: 'string' } },
                    required: ['branchId'],
                },
                readOnly: true,
                requiredPermission: 'dashboard.sales.view',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    return json(await this.dashboard.getSummary(branchId));
                },
            },
            {
                name: 'list_open_orders',
                title: 'List open orders',
                description: 'List currently open orders for one location, optionally filtered to one table.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string' },
                        tableId: { type: 'string' },
                    },
                    required: ['branchId'],
                },
                readOnly: true,
                requiredPermission: 'orders.create',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    return json(await this.orders.listOpen(branchId, args.optionalString('tableId')));
                },
            },
            {
                name: 'get_order',
                title: 'Get order',
                description: 'Get full detail (items, KOTs, payments) for one order.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string' },
                        orderId: { type: 'string' },
                    },
                    required: ['branchId', 'orderId'],
                },
                readOnly: true,
                requiredPermission: 'orders.create',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    return json(await this.orders.getOrder(branchId, args.string('orderId')));
                },
            },
            {
                name: 'create_order',
                title: 'Create order',
                description: 'Create a new takeaway/delivery/dine-in order at one location.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string' },
                        type: {
                            type: 'string',
                            enum: ['DINE_IN', 'TAKEAWAY', 'DELIVERY', 'PHONE'],
                        },
                        tableId: { type: 'string' },
                        guestName: { type: 'string' },
                        notes: { type: 'string' },
                        items: {
                            type: 'array',
                            description: 'Cart items: [{ menuItemId, quantity, modifierIds?, kitchenNote? }]',
                        },
                    },
                    required: ['branchId', 'items'],
                },
                readOnly: false,
                requiredPermission: 'orders.create',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    return json(await this.orders.createOrder(branchId, actor.id, {
                        type: args.optionalString('type') ?? 'DINE_IN',
                        tableId: args.optionalString('tableId'),
                        guestName: args.optionalString('guestName'),
                        notes: args.optionalString('notes'),
                        items: args.items('items'),
                    }));
                },
            },
            {
                name: 'list_deliveries',
                title: 'List deliveries',
                description: 'List delivery orders for one location — active ones by default, or finished/failed ones with history=true. Each shows address, zone, fee, driver and delivery status.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string' },
                        history: { type: 'boolean' },
                    },
                    required: ['branchId'],
                },
                readOnly: true,
                requiredPermission: 'delivery.manage',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    return json(await this.delivery.list(branchId, args.optionalBoolean('history')));
                },
            },
            {
                name: 'assign_driver',
                title: 'Assign delivery driver',
                description: 'Assign a staff member as the driver for a delivery order.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string' },
                        orderId: { type: 'string' },
                        driverId: { type: 'string' },
                    },
                    required: ['branchId', 'orderId', 'driverId'],
                },
                readOnly: false,
                requiredPermission: 'delivery.manage',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    return json(await this.delivery.assignDriver(branchId, args.string('orderId'), args.string('driverId')));
                },
            },
            {
                name: 'update_delivery_status',
                title: 'Update delivery status',
                description: 'Move a delivery along: ASSIGNED -> PICKED_UP -> DELIVERED (or FAILED).',
                inputSchema: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string' },
                        orderId: { type: 'string' },
                        status: {
                            type: 'string',
                            enum: [
                                'UNASSIGNED',
                                'ASSIGNED',
                                'PICKED_UP',
                                'DELIVERED',
                                'FAILED',
                            ],
                        },
                    },
                    required: ['branchId', 'orderId', 'status'],
                },
                readOnly: false,
                requiredPermission: 'delivery.manage',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    return json(await this.delivery.setStatus(branchId, args.string('orderId'), args.string('status')));
                },
            },
            {
                name: 'list_delivery_zones',
                title: 'List delivery zones',
                description: "List a location's delivery zones (fee, minimum order, ETA, pincodes).",
                inputSchema: {
                    type: 'object',
                    properties: { branchId: { type: 'string' } },
                    required: ['branchId'],
                },
                readOnly: true,
                requiredPermission: 'delivery.manage',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    return json(await this.delivery.listZones(branchId));
                },
            },
            {
                name: 'list_shifts',
                title: 'List staff shifts',
                description: 'List scheduled staff shifts for one location, optionally between two dates (YYYY-MM-DD).',
                inputSchema: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string' },
                        from: { type: 'string' },
                        to: { type: 'string' },
                    },
                    required: ['branchId'],
                },
                readOnly: true,
                requiredPermission: 'staff.manage',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    return json(await this.hr.listShifts(branchId, args.optionalString('from'), args.optionalString('to')));
                },
            },
            {
                name: 'list_leave_requests',
                title: 'List leave requests',
                description: 'List staff leave requests for one location, optionally only PENDING, APPROVED or REJECTED.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string' },
                        status: { type: 'string' },
                    },
                    required: ['branchId'],
                },
                readOnly: true,
                requiredPermission: 'staff.manage',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    return json(await this.hr.listLeave(branchId, args.optionalString('status')));
                },
            },
            {
                name: 'decide_leave_request',
                title: 'Approve or reject leave',
                description: 'Approve or reject a pending leave request.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string' },
                        leaveId: { type: 'string' },
                        status: { type: 'string', enum: ['APPROVED', 'REJECTED'] },
                    },
                    required: ['branchId', 'leaveId', 'status'],
                },
                readOnly: false,
                requiredPermission: 'staff.manage',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    const status = args.string('status');
                    if (status !== 'APPROVED' && status !== 'REJECTED')
                        throw new Error('"status" must be APPROVED or REJECTED');
                    return json(await this.hr.decideLeave(branchId, args.string('leaveId'), actor.id, status));
                },
            },
            {
                name: 'staff_performance',
                title: 'Staff performance',
                description: 'Per-staff orders, sales, tips, hours worked and sales per hour between two dates (YYYY-MM-DD).',
                inputSchema: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string' },
                        from: { type: 'string' },
                        to: { type: 'string' },
                    },
                    required: ['branchId', 'from', 'to'],
                },
                readOnly: true,
                requiredPermission: 'staff.manage',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    return json(await this.hr.performance(branchId, args.string('from'), args.string('to')));
                },
            },
            {
                name: 'profit_and_loss',
                title: 'Profit and loss',
                description: 'Net sales, expenses by category, payroll cost and net profit for a location between two dates (YYYY-MM-DD).',
                inputSchema: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string' },
                        from: { type: 'string' },
                        to: { type: 'string' },
                    },
                    required: ['branchId', 'from', 'to'],
                },
                readOnly: true,
                requiredPermission: 'accounting.manage',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    return json(await this.accounting.profitAndLoss(branchId, args.string('from'), args.string('to')));
                },
            },
            {
                name: 'gst_report',
                title: 'GST / tax report',
                description: 'Taxable value and tax collected, grouped by tax rate, between two dates (YYYY-MM-DD).',
                inputSchema: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string' },
                        from: { type: 'string' },
                        to: { type: 'string' },
                    },
                    required: ['branchId', 'from', 'to'],
                },
                readOnly: true,
                requiredPermission: 'accounting.manage',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    return json(await this.accounting.gstReport(branchId, args.string('from'), args.string('to')));
                },
            },
            {
                name: 'list_expenses',
                title: 'List expenses',
                description: 'List recorded expenses for a location between two dates (YYYY-MM-DD).',
                inputSchema: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string' },
                        from: { type: 'string' },
                        to: { type: 'string' },
                    },
                    required: ['branchId', 'from', 'to'],
                },
                readOnly: true,
                requiredPermission: 'accounting.manage',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    return json(await this.accounting.listExpenses(branchId, args.string('from'), args.string('to')));
                },
            },
            {
                name: 'run_report',
                title: 'Run a report',
                description: 'Run a catalog report (sales-daily, sales-by-item, popular-items, slow-movers, payment-methods, discounts, tax, peak-hours, food-cost, customers, retention, staff-sales, table-turnover, reservations, delivery, waste, inventory-valuation) for a location between two dates (YYYY-MM-DD). Returns columns and rows.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string' },
                        report: { type: 'string' },
                        from: { type: 'string' },
                        to: { type: 'string' },
                    },
                    required: ['branchId', 'report', 'from', 'to'],
                },
                readOnly: true,
                requiredPermission: 'reports.access',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    (0, reports_service_1.assertCanViewReport)(actor.permissions, args.string('report'));
                    await this.assertBranch(actor, branchId);
                    return json(await this.reports.run(args.string('report'), branchId, args.string('from'), args.string('to')));
                },
            },
            {
                name: 'list_coupons',
                title: 'List coupons',
                description: 'List coupon codes for a location with usage counts.',
                inputSchema: {
                    type: 'object',
                    properties: { branchId: { type: 'string' } },
                    required: ['branchId'],
                },
                readOnly: true,
                requiredPermission: 'marketing.manage',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    return json(await this.marketing.listCoupons(branchId));
                },
            },
            {
                name: 'list_promotions',
                title: 'List happy-hour promotions',
                description: 'List automatic time-window discounts for a location.',
                inputSchema: {
                    type: 'object',
                    properties: { branchId: { type: 'string' } },
                    required: ['branchId'],
                },
                readOnly: true,
                requiredPermission: 'marketing.manage',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    return json(await this.marketing.listPromotions(branchId));
                },
            },
            {
                name: 'list_equipment',
                title: 'List equipment',
                description: 'List kitchen/restaurant equipment with next service due dates and overdue flags.',
                inputSchema: {
                    type: 'object',
                    properties: { branchId: { type: 'string' } },
                    required: ['branchId'],
                },
                readOnly: true,
                requiredPermission: 'operations.manage',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    return json(await this.operations.listEquipment(branchId));
                },
            },
            {
                name: 'list_attendance',
                title: 'List staff attendance',
                description: 'List staff clock-in/clock-out records for one location, optionally on one date (YYYY-MM-DD) or for one staff member. A null clockOutAt means the person is still on shift.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string' },
                        date: { type: 'string' },
                        userId: { type: 'string' },
                    },
                    required: ['branchId'],
                },
                readOnly: true,
                requiredPermission: 'attendance.manage',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    return json(await this.attendance.list(branchId, args.optionalString('date'), args.optionalString('userId')));
                },
            },
            {
                name: 'clock_in',
                title: 'Clock in',
                description: 'Clock the calling staff member in at a location.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string' },
                        note: { type: 'string' },
                    },
                    required: ['branchId'],
                },
                readOnly: false,
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    return json(await this.attendance.clockIn(actor.id, branchId, args.optionalString('note')));
                },
            },
            {
                name: 'clock_out',
                title: 'Clock out',
                description: 'Clock the calling staff member out of their open shift.',
                inputSchema: {
                    type: 'object',
                    properties: { note: { type: 'string' } },
                },
                readOnly: false,
                handler: async (args) => json(await this.attendance.clockOut(actor.id, args.optionalString('note'))),
            },
            {
                name: 'list_reservations',
                title: 'List reservations',
                description: 'List reservations for one location, optionally on one date (YYYY-MM-DD).',
                inputSchema: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string' },
                        date: { type: 'string' },
                    },
                    required: ['branchId'],
                },
                readOnly: true,
                requiredPermission: 'reservations.manage',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    return json(await this.reservations.list(branchId, args.optionalString('date')));
                },
            },
            {
                name: 'create_reservation',
                title: 'Book a table (reservation)',
                description: 'Create a new table reservation at one location.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string' },
                        customerName: { type: 'string' },
                        phone: { type: 'string' },
                        guestCount: { type: 'number' },
                        reservedAt: { type: 'string', description: 'ISO 8601 date-time' },
                        durationMinutes: { type: 'number' },
                        tableId: { type: 'string' },
                        specialRequests: { type: 'string' },
                    },
                    required: ['branchId', 'customerName', 'guestCount', 'reservedAt'],
                },
                readOnly: false,
                requiredPermission: 'reservations.manage',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    return json(await this.reservations.create(branchId, {
                        customerName: args.string('customerName'),
                        phone: args.optionalString('phone'),
                        guestCount: args.number('guestCount'),
                        reservedAt: new Date(args.string('reservedAt')),
                        durationMinutes: args.optionalNumber('durationMinutes') ?? 90,
                        tableId: args.optionalString('tableId'),
                        specialRequests: args.optionalString('specialRequests'),
                    }));
                },
            },
            {
                name: 'update_reservation_status',
                title: 'Update reservation status',
                description: `Transition a reservation to a new status: one of ${RESERVATION_STATUS_VALUES.join(', ')}.`,
                inputSchema: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string' },
                        reservationId: { type: 'string' },
                        status: { type: 'string', enum: RESERVATION_STATUS_VALUES },
                    },
                    required: ['branchId', 'reservationId', 'status'],
                },
                readOnly: false,
                requiredPermission: 'reservations.manage',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    const status = args.string('status');
                    if (!isReservationStatus(status)) {
                        throw new Error(`Invalid status "${status}". Must be one of: ${RESERVATION_STATUS_VALUES.join(', ')}`);
                    }
                    return json(await this.reservations.updateStatus(branchId, args.string('reservationId'), status));
                },
            },
            {
                name: 'create_menu_category',
                title: 'Create menu category',
                description: 'Create a new menu category (e.g. "Chicken", "Cocktail") at one location.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string' },
                        name: { type: 'string' },
                        sortOrder: { type: 'number' },
                    },
                    required: ['branchId', 'name'],
                },
                readOnly: false,
                requiredPermission: 'menu.manage',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    return json(await this.menu.createCategory(branchId, {
                        name: args.string('name'),
                        sortOrder: args.optionalNumber('sortOrder') ?? 0,
                        isActive: true,
                        showOnWebsite: true,
                    }));
                },
            },
            {
                name: 'create_menu_item',
                title: 'Create menu item',
                description: 'Create a new menu item (dish) inside an existing category, with price and optional image URL.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string' },
                        categoryId: { type: 'string' },
                        name: { type: 'string' },
                        price: { type: 'number' },
                        description: { type: 'string' },
                        imageUrl: {
                            type: 'string',
                            description: 'Public HTTPS URL of a photo for this dish',
                        },
                        isVeg: { type: 'boolean' },
                        spiceLevel: { type: 'string', enum: SPICE_LEVEL_VALUES },
                    },
                    required: ['branchId', 'categoryId', 'name', 'price'],
                },
                readOnly: false,
                requiredPermission: 'menu.manage',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    const spiceLevel = args.optionalString('spiceLevel') ?? 'NONE';
                    if (!SPICE_LEVEL_VALUES.includes(spiceLevel)) {
                        throw new Error(`Invalid spiceLevel "${spiceLevel}". Must be one of: ${SPICE_LEVEL_VALUES.join(', ')}`);
                    }
                    return json(await this.menu.createItem(branchId, {
                        categoryId: args.string('categoryId'),
                        name: args.string('name'),
                        price: args.number('price'),
                        description: args.optionalString('description'),
                        imageUrl: args.optionalString('imageUrl'),
                        taxRatePercent: 0,
                        isVeg: args.optionalBoolean('isVeg') ?? true,
                        isVegan: false,
                        isJain: false,
                        isHalal: false,
                        isGlutenFree: false,
                        spiceLevel: spiceLevel,
                        allergens: [],
                        isActive: true,
                        modifierGroupIds: [],
                    }));
                },
            },
            {
                name: 'create_floor',
                title: 'Create floor / section',
                description: 'Create a new floor or dining section (e.g. "Main Hall", "Bar") at one location.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string' },
                        name: { type: 'string' },
                        sortOrder: { type: 'number' },
                    },
                    required: ['branchId', 'name'],
                },
                readOnly: false,
                requiredPermission: 'tables.manage',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    return json(await this.tables.createFloor(branchId, {
                        name: args.string('name'),
                        sortOrder: args.optionalNumber('sortOrder') ?? 0,
                    }));
                },
            },
            {
                name: 'create_tables_bulk',
                title: 'Bulk-create tables',
                description: 'Create multiple tables at once on one floor/section, given a list of table numbers.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string' },
                        floorId: { type: 'string' },
                        numbers: {
                            type: 'array',
                            description: 'Table numbers/names, e.g. ["1","2","3"]',
                        },
                        capacity: { type: 'number' },
                        shape: { type: 'string', enum: TABLE_SHAPE_VALUES },
                    },
                    required: ['branchId', 'floorId', 'numbers'],
                },
                readOnly: false,
                requiredPermission: 'tables.manage',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    const shape = args.optionalString('shape') ?? 'square';
                    if (!TABLE_SHAPE_VALUES.includes(shape)) {
                        throw new Error(`Invalid shape "${shape}". Must be one of: ${TABLE_SHAPE_VALUES.join(', ')}`);
                    }
                    return json(await this.tables.createTables(branchId, {
                        floorId: args.string('floorId'),
                        numbers: args.stringArray('numbers'),
                        capacity: args.optionalNumber('capacity') ?? 4,
                        shape: shape,
                    }));
                },
            },
            {
                name: 'cancel_order',
                title: 'Cancel order',
                description: 'Cancel an OPEN order. A reason is required once the kitchen has accepted a ticket. If the kitchen already began preparing, the call is refused unless confirmStarted is true (the food in progress is wasted). Fails if part was already served or the order is paid (use refund_order instead).',
                inputSchema: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string' },
                        orderId: { type: 'string' },
                        reason: { type: 'string', description: 'Why it is cancelled' },
                        confirmStarted: {
                            type: 'boolean',
                            description: 'Cancel even though cooking has started',
                        },
                        guestRequested: {
                            type: 'boolean',
                            description: 'The guest asked to cancel (default: staff)',
                        },
                    },
                    required: ['branchId', 'orderId'],
                },
                readOnly: false,
                requiredPermission: 'orders.cancel',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    return json(await this.orders.cancelOrder(branchId, args.string('orderId'), actor.id, args.optionalString('reason'), {
                        confirmStarted: args.optionalBoolean('confirmStarted'),
                        source: args.optionalBoolean('guestRequested')
                            ? 'CUSTOMER'
                            : 'STAFF',
                    }));
                },
            },
            {
                name: 'refund_order',
                title: 'Refund order',
                description: 'Refund some or all of a PAID order. Amount cannot exceed what remains refundable.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string' },
                        orderId: { type: 'string' },
                        amount: { type: 'number' },
                        method: { type: 'string', enum: PAYMENT_METHOD_VALUES },
                        reason: { type: 'string' },
                    },
                    required: ['branchId', 'orderId', 'amount', 'method'],
                },
                readOnly: false,
                requiredPermission: 'refunds.process',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    const method = args.string('method');
                    if (!PAYMENT_METHOD_VALUES.includes(method)) {
                        throw new Error(`Invalid method "${method}". Must be one of: ${PAYMENT_METHOD_VALUES.join(', ')}`);
                    }
                    return json(await this.orders.refund(branchId, args.string('orderId'), actor.id, {
                        amount: args.number('amount'),
                        method: method,
                        reason: args.optionalString('reason'),
                    }));
                },
            },
            {
                name: 'update_menu_category',
                title: 'Update menu category',
                description: 'Rename, reorder, or activate/deactivate an existing menu category.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string' },
                        categoryId: { type: 'string' },
                        name: { type: 'string' },
                        sortOrder: { type: 'number' },
                        isActive: { type: 'boolean' },
                    },
                    required: ['branchId', 'categoryId'],
                },
                readOnly: false,
                requiredPermission: 'menu.manage',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    const dto = {};
                    const name = args.optionalString('name');
                    const sortOrder = args.optionalNumber('sortOrder');
                    const isActive = args.optionalBoolean('isActive');
                    if (name !== undefined)
                        dto.name = name;
                    if (sortOrder !== undefined)
                        dto.sortOrder = sortOrder;
                    if (isActive !== undefined)
                        dto.isActive = isActive;
                    return json(await this.menu.updateCategory(branchId, args.string('categoryId'), dto));
                },
            },
            {
                name: 'delete_menu_category',
                title: 'Delete menu category',
                description: 'Permanently delete a menu category. Fails if it still has items — delete or move those first.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string' },
                        categoryId: { type: 'string' },
                    },
                    required: ['branchId', 'categoryId'],
                },
                readOnly: false,
                requiredPermission: 'menu.manage',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    return json(await this.menu.deleteCategory(branchId, args.string('categoryId')));
                },
            },
            {
                name: 'update_menu_item',
                title: 'Update menu item',
                description: 'Change any fields (price, name, description, image, availability, veg flag, spice level) on an existing menu item.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string' },
                        itemId: { type: 'string' },
                        name: { type: 'string' },
                        price: { type: 'number' },
                        description: { type: 'string' },
                        imageUrl: { type: 'string' },
                        isVeg: { type: 'boolean' },
                        isActive: { type: 'boolean' },
                        spiceLevel: { type: 'string', enum: SPICE_LEVEL_VALUES },
                    },
                    required: ['branchId', 'itemId'],
                },
                readOnly: false,
                requiredPermission: 'menu.manage',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    const dto = {};
                    const name = args.optionalString('name');
                    const price = args.optionalNumber('price');
                    const description = args.optionalString('description');
                    const imageUrl = args.optionalString('imageUrl');
                    const isVeg = args.optionalBoolean('isVeg');
                    const isActive = args.optionalBoolean('isActive');
                    const spiceLevel = args.optionalString('spiceLevel');
                    if (name !== undefined)
                        dto.name = name;
                    if (price !== undefined)
                        dto.price = price;
                    if (description !== undefined)
                        dto.description = description;
                    if (imageUrl !== undefined)
                        dto.imageUrl = imageUrl;
                    if (isVeg !== undefined)
                        dto.isVeg = isVeg;
                    if (isActive !== undefined)
                        dto.isActive = isActive;
                    if (spiceLevel !== undefined) {
                        if (!SPICE_LEVEL_VALUES.includes(spiceLevel)) {
                            throw new Error(`Invalid spiceLevel "${spiceLevel}". Must be one of: ${SPICE_LEVEL_VALUES.join(', ')}`);
                        }
                        dto.spiceLevel = spiceLevel;
                    }
                    return json(await this.menu.updateItem(branchId, args.string('itemId'), actor.id, dto));
                },
            },
            {
                name: 'delete_menu_item',
                title: 'Delete menu item',
                description: 'Permanently delete a menu item.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string' },
                        itemId: { type: 'string' },
                    },
                    required: ['branchId', 'itemId'],
                },
                readOnly: false,
                requiredPermission: 'menu.manage',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    return json(await this.menu.deleteItem(branchId, args.string('itemId')));
                },
            },
            {
                name: 'update_floor',
                title: 'Update floor / section',
                description: 'Rename or reorder an existing floor/section.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string' },
                        floorId: { type: 'string' },
                        name: { type: 'string' },
                        sortOrder: { type: 'number' },
                    },
                    required: ['branchId', 'floorId'],
                },
                readOnly: false,
                requiredPermission: 'tables.manage',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    const dto = {};
                    const name = args.optionalString('name');
                    const sortOrder = args.optionalNumber('sortOrder');
                    if (name !== undefined)
                        dto.name = name;
                    if (sortOrder !== undefined)
                        dto.sortOrder = sortOrder;
                    return json(await this.tables.updateFloor(branchId, args.string('floorId'), dto));
                },
            },
            {
                name: 'update_table',
                title: 'Update table',
                description: "Change a table's number, name, capacity, shape or notes.",
                inputSchema: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string' },
                        tableId: { type: 'string' },
                        number: { type: 'string' },
                        name: { type: 'string' },
                        capacity: { type: 'number' },
                        shape: { type: 'string', enum: TABLE_SHAPE_VALUES },
                        notes: { type: 'string' },
                    },
                    required: ['branchId', 'tableId'],
                },
                readOnly: false,
                requiredPermission: 'tables.manage',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    const dto = {};
                    const number = args.optionalString('number');
                    const name = args.optionalString('name');
                    const capacity = args.optionalNumber('capacity');
                    const shape = args.optionalString('shape');
                    const notes = args.optionalString('notes');
                    if (number !== undefined)
                        dto.number = number;
                    if (name !== undefined)
                        dto.name = name;
                    if (capacity !== undefined)
                        dto.capacity = capacity;
                    if (notes !== undefined)
                        dto.notes = notes;
                    if (shape !== undefined) {
                        if (!TABLE_SHAPE_VALUES.includes(shape)) {
                            throw new Error(`Invalid shape "${shape}". Must be one of: ${TABLE_SHAPE_VALUES.join(', ')}`);
                        }
                        dto.shape = shape;
                    }
                    return json(await this.tables.updateTable(branchId, args.string('tableId'), dto));
                },
            },
            {
                name: 'update_table_status',
                title: 'Update table status',
                description: `Change a table's status: one of ${TABLE_STATUS_VALUES.join(', ')}.`,
                inputSchema: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string' },
                        tableId: { type: 'string' },
                        status: { type: 'string', enum: TABLE_STATUS_VALUES },
                    },
                    required: ['branchId', 'tableId', 'status'],
                },
                readOnly: false,
                requiredPermission: 'tables.manage',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    const status = args.string('status');
                    if (!TABLE_STATUS_VALUES.includes(status)) {
                        throw new Error(`Invalid status "${status}". Must be one of: ${TABLE_STATUS_VALUES.join(', ')}`);
                    }
                    return json(await this.tables.updateTableStatus(branchId, args.string('tableId'), status));
                },
            },
            {
                name: 'delete_table',
                title: 'Delete table',
                description: 'Permanently delete a table.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        branchId: { type: 'string' },
                        tableId: { type: 'string' },
                    },
                    required: ['branchId', 'tableId'],
                },
                readOnly: false,
                requiredPermission: 'tables.manage',
                handler: async (args) => {
                    const branchId = args.string('branchId');
                    await this.assertBranch(actor, branchId);
                    return json(await this.tables.deleteTable(branchId, args.string('tableId')));
                },
            },
        ];
    }
};
exports.McpToolsBuilder = McpToolsBuilder;
exports.McpToolsBuilder = McpToolsBuilder = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        branch_access_service_1.BranchAccessService,
        orders_service_1.OrdersService,
        reservations_service_1.ReservationsService,
        dashboard_service_1.DashboardService,
        menu_service_1.MenuService,
        tables_service_1.TablesService,
        attendance_service_1.AttendanceService,
        delivery_service_1.DeliveryService,
        hr_service_1.HrService,
        accounting_service_1.AccountingService,
        reports_service_1.ReportsService,
        marketing_service_1.MarketingService,
        operations_service_1.OperationsService])
], McpToolsBuilder);
//# sourceMappingURL=mcp-tools.builder.js.map