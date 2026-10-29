import type { TaxMode } from '@nodedr-restaurant/types';
export declare function toEffectiveInclusiveUnitPrice(rawUnitPrice: number, taxRatePercent: number, taxMode: TaxMode): number;
export interface PricedLineInput {
    quantity: number;
    unitPriceInclusive: number;
    taxRatePercent: number;
}
export interface PricedLine {
    lineTotal: number;
    taxAmount: number;
}
export declare function round2(value: number): number;
export declare function priceLine(input: PricedLineInput): PricedLine;
export interface OrderTotals {
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
}
export declare function computeOrderTotals(lines: PricedLine[], discountPercent?: number, discountFlat?: number): OrderTotals;
