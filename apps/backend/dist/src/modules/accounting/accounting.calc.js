"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.round2 = void 0;
exports.gstSummary = gstSummary;
exports.expectedCash = expectedCash;
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
exports.round2 = round2;
function gstSummary(lines) {
    const byRate = new Map();
    for (const l of lines) {
        const charged = l.lineTotal * l.factor;
        const tax = (charged * l.taxRatePercent) / (100 + l.taxRatePercent);
        const row = byRate.get(l.taxRatePercent) ?? { total: 0, tax: 0 };
        row.total += charged;
        row.tax += tax;
        byRate.set(l.taxRatePercent, row);
    }
    const rows = [...byRate.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([ratePercent, v]) => ({
        ratePercent,
        taxableValue: (0, exports.round2)(v.total - v.tax),
        tax: (0, exports.round2)(v.tax),
        total: (0, exports.round2)(v.total),
    }));
    return {
        rows,
        totalTaxable: (0, exports.round2)(rows.reduce((s, r) => s + r.taxableValue, 0)),
        totalTax: (0, exports.round2)(rows.reduce((s, r) => s + r.tax, 0)),
    };
}
function expectedCash(openingFloat, cashSales, cashRefunds, cashExpenses) {
    return (0, exports.round2)(openingFloat + cashSales - cashRefunds - cashExpenses);
}
//# sourceMappingURL=accounting.calc.js.map