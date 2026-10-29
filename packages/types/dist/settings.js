"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.branchSettingsSchema = exports.restaurantSettingsSchema = exports.RESTAURANT_NAME_MAX_LENGTH = void 0;
const zod_1 = require("zod");
// The restaurant's brand name renders in the app shell's top-of-sidebar
// header (fixed-width column, next to the logo) — a name much past this
// starts wrapping/truncating there, so the settings form enforces the same
// limit the layout was built around rather than letting it overflow.
exports.RESTAURANT_NAME_MAX_LENGTH = 40;
exports.restaurantSettingsSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(exports.RESTAURANT_NAME_MAX_LENGTH).optional(),
    legalName: zod_1.z.string().optional(),
    // Shown in place of the product logo in the app shell header and on the
    // login screen once set. Square, ~256x256px+ PNG/SVG with a transparent
    // background reads best in that slot — see the settings page hint text.
    logoUrl: zod_1.z.string().max(2048).optional().nullable(),
    currency: zod_1.z.string().optional(),
    timezone: zod_1.z.string().optional(),
    // UPI id such as "name@okbank" (VPA format per NPCI: handle@psp).
    upiVpa: zod_1.z
        .string()
        .trim()
        .regex(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z][a-zA-Z0-9]{1,64}$/, "Enter a valid UPI id like name@bank")
        .optional()
        .nullable(),
    upiPayeeName: zod_1.z.string().trim().max(60).optional().nullable(),
    loyaltyPointValue: zod_1.z.coerce.number().min(0).optional(),
    loyaltyEarnPerCurrency: zod_1.z.coerce.number().int().positive().optional(),
});
const tax_1 = require("./tax");
exports.branchSettingsSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    address: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    gstNumber: zod_1.z.string().optional(),
    // Multi-region tax config — see tax.ts for the regime presets this
    // pairs with (label, default mode, CGST/SGST split).
    country: zod_1.z.string().length(2).optional(),
    taxRegime: zod_1.z.enum(tax_1.TAX_REGIMES).optional(),
    taxMode: zod_1.z.enum(tax_1.TAX_MODES).optional(),
    taxLabel: zod_1.z.string().max(30).optional().nullable(),
    taxId: zod_1.z.string().max(50).optional().nullable(),
    // Online order / table-booking handling (false = staff accept manually).
    autoConfirmOrders: zod_1.z.boolean().optional(),
    autoConfirmReservations: zod_1.z.boolean().optional(),
    // Self-service kiosk: which service-mode buttons the start screen offers.
    kioskDineInEnabled: zod_1.z.boolean().optional(),
    kioskTakeawayEnabled: zod_1.z.boolean().optional(),
    // Thermal printer (direct ESC/POS): paper, code page and column override.
    printerPaperWidthMm: zod_1.z.union([zod_1.z.literal(58), zod_1.z.literal(80)]).optional(),
    printerCodepage: zod_1.z.enum(["CP437", "CP850", "CP858", "CP1252"]).optional(),
    printerColumns: zod_1.z.number().int().min(20).max(64).nullable().optional(),
    // How the server reaches the thermal printer: USB attached to the server,
    // or a network printer (raw ESC/POS over TCP, normally port 9100).
    printerConnection: zod_1.z.enum(["USB", "NETWORK"]).optional(),
    printerHost: zod_1.z
        .string()
        .trim()
        .max(253)
        .regex(/^[A-Za-z0-9.-]+$/, "Use an IP address or host name")
        .nullable()
        .optional(),
    printerPort: zod_1.z.number().int().min(1).max(65535).optional(),
});
