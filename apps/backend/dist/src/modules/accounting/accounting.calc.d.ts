export declare const round2: (n: number) => number;
export interface GstLine {
    lineTotal: number;
    taxRatePercent: number;
}
export interface GstRow {
    ratePercent: number;
    taxableValue: number;
    tax: number;
    total: number;
}
export declare function gstSummary(lines: (GstLine & {
    factor: number;
})[]): {
    rows: GstRow[];
    totalTaxable: number;
    totalTax: number;
};
export declare function expectedCash(openingFloat: number, cashSales: number, cashRefunds: number, cashExpenses: number): number;
