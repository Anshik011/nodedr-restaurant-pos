"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toEffectiveInclusiveUnitPrice = toEffectiveInclusiveUnitPrice;
exports.round2 = round2;
exports.priceLine = priceLine;
exports.computeOrderTotals = computeOrderTotals;
function toEffectiveInclusiveUnitPrice(rawUnitPrice, taxRatePercent, taxMode) {
    if (taxMode === 'EXCLUSIVE' && taxRatePercent > 0) {
        return round2(rawUnitPrice * (1 + taxRatePercent / 100));
    }
    return round2(rawUnitPrice);
}
function round2(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}
function priceLine(input) {
    const lineTotal = round2(input.unitPriceInclusive * input.quantity);
    const rate = input.taxRatePercent / 100;
    const taxAmount = rate > 0 ? round2(lineTotal - lineTotal / (1 + rate)) : 0;
    return { lineTotal, taxAmount };
}
function computeOrderTotals(lines, discountPercent = 0, discountFlat = 0) {
    const subtotal = round2(lines.reduce((sum, l) => sum + l.lineTotal, 0));
    const taxAmount = round2(lines.reduce((sum, l) => sum + l.taxAmount, 0));
    const percentDiscount = round2((subtotal * discountPercent) / 100);
    const discountAmount = round2(Math.min(percentDiscount + discountFlat, subtotal));
    const totalAmount = round2(subtotal - discountAmount);
    return { subtotal, taxAmount, discountAmount, totalAmount };
}
//# sourceMappingURL=pricing.js.map