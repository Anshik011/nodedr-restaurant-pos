import { z } from "zod";
export declare const TAX_MODES: readonly ["INCLUSIVE", "EXCLUSIVE"];
export type TaxMode = (typeof TAX_MODES)[number];
export declare const TAX_REGIMES: readonly ["INDIA_GST", "US_SALES_TAX", "EU_VAT", "ES_IVA", "CUSTOM"];
export type TaxRegime = (typeof TAX_REGIMES)[number];
export interface TaxRegimePreset {
    regime: TaxRegime;
    /** Shown in the Settings picker. */
    displayName: string;
    /** Default menu-item pricing mode for this regime. */
    defaultMode: TaxMode;
    /** What the receipt/POS calls the tax line, e.g. "GST", "VAT", "Sales Tax". */
    taxLabel: string;
    /** Label for the branch's tax registration number field. */
    taxIdLabel: string;
    /** India-only: split the tax line into CGST/SGST halves on receipts. */
    splitCgstSgst: boolean;
    /** A couple of illustrative example rates — NOT prescriptive or legal advice. */
    exampleRates: string;
    /** Suggested default country (ISO 3166-1 alpha-2) when this regime is picked. */
    defaultCountry: string;
}
export declare const TAX_REGIME_PRESETS: Record<TaxRegime, TaxRegimePreset>;
/** Effective receipt label for a branch: explicit taxLabel override wins, else the regime preset's. */
export declare function resolveTaxLabel(taxRegime: TaxRegime, taxLabel?: string | null): string;
/** Effective tax-id field label for a branch. */
export declare function resolveTaxIdLabel(taxRegime: TaxRegime): string;
export declare const branchTaxSettingsSchema: z.ZodObject<{
    country: z.ZodOptional<z.ZodString>;
    taxRegime: z.ZodOptional<z.ZodEnum<{
        CUSTOM: "CUSTOM";
        INDIA_GST: "INDIA_GST";
        US_SALES_TAX: "US_SALES_TAX";
        EU_VAT: "EU_VAT";
        ES_IVA: "ES_IVA";
    }>>;
    taxMode: z.ZodOptional<z.ZodEnum<{
        INCLUSIVE: "INCLUSIVE";
        EXCLUSIVE: "EXCLUSIVE";
    }>>;
    taxLabel: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    taxId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type BranchTaxSettingsDto = z.infer<typeof branchTaxSettingsSchema>;
