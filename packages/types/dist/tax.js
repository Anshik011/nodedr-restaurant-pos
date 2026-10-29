"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.branchTaxSettingsSchema = exports.TAX_REGIME_PRESETS = exports.TAX_REGIMES = exports.TAX_MODES = void 0;
exports.resolveTaxLabel = resolveTaxLabel;
exports.resolveTaxIdLabel = resolveTaxIdLabel;
const zod_1 = require("zod");
// Multi-region tax support (2026-09-27). A branch picks a TaxRegime, which
// supplies sensible defaults for how the receipt labels tax and whether
// menu item prices already have tax baked in. See ARCHITECTURE.md and
// apps/backend/src/modules/orders/pricing.ts for the pricing-math side of
// this — this file is only the shared preset table + branch tax-settings
// DTO, used by both the API and the web app so the two never drift.
exports.TAX_MODES = ["INCLUSIVE", "EXCLUSIVE"];
exports.TAX_REGIMES = [
    "INDIA_GST",
    "US_SALES_TAX",
    "EU_VAT",
    "ES_IVA",
    "CUSTOM",
];
exports.TAX_REGIME_PRESETS = {
    INDIA_GST: {
        regime: "INDIA_GST",
        displayName: "India — GST",
        defaultMode: "INCLUSIVE",
        taxLabel: "GST",
        taxIdLabel: "GSTIN",
        splitCgstSgst: true,
        exampleRates: "5% / 12% / 18% (typical restaurant slabs)",
        defaultCountry: "IN",
    },
    US_SALES_TAX: {
        regime: "US_SALES_TAX",
        displayName: "United States — Sales Tax",
        defaultMode: "EXCLUSIVE",
        taxLabel: "Sales Tax",
        taxIdLabel: "Sales Tax / EIN",
        splitCgstSgst: false,
        exampleRates: "Varies by state/city — commonly 6–10%",
        defaultCountry: "US",
    },
    EU_VAT: {
        regime: "EU_VAT",
        displayName: "European Union — VAT",
        defaultMode: "INCLUSIVE",
        taxLabel: "VAT",
        taxIdLabel: "VAT No.",
        splitCgstSgst: false,
        exampleRates: "Reduced rate often applies to dine-in food, e.g. 10% Germany / 10% Italy",
        defaultCountry: "DE",
    },
    ES_IVA: {
        regime: "ES_IVA",
        displayName: "Spain — IVA",
        defaultMode: "INCLUSIVE",
        taxLabel: "IVA",
        taxIdLabel: "NIF/CIF",
        splitCgstSgst: false,
        exampleRates: "10% (hospitality reduced rate) / 21% (general rate)",
        defaultCountry: "ES",
    },
    CUSTOM: {
        regime: "CUSTOM",
        displayName: "Custom",
        defaultMode: "INCLUSIVE",
        taxLabel: "Tax",
        taxIdLabel: "Tax ID",
        splitCgstSgst: false,
        exampleRates: "Set per menu item",
        defaultCountry: "IN",
    },
};
/** Effective receipt label for a branch: explicit taxLabel override wins, else the regime preset's. */
function resolveTaxLabel(taxRegime, taxLabel) {
    return taxLabel?.trim() || exports.TAX_REGIME_PRESETS[taxRegime].taxLabel;
}
/** Effective tax-id field label for a branch. */
function resolveTaxIdLabel(taxRegime) {
    return exports.TAX_REGIME_PRESETS[taxRegime].taxIdLabel;
}
exports.branchTaxSettingsSchema = zod_1.z.object({
    country: zod_1.z.string().length(2).optional(),
    taxRegime: zod_1.z.enum(exports.TAX_REGIMES).optional(),
    taxMode: zod_1.z.enum(exports.TAX_MODES).optional(),
    taxLabel: zod_1.z.string().max(30).optional().nullable(),
    taxId: zod_1.z.string().max(50).optional().nullable(),
});
