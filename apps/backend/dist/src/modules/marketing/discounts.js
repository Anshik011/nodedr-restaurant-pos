"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromMinutes = exports.toMinutes = exports.round2 = void 0;
exports.discountAmount = discountAmount;
exports.evaluateCoupon = evaluateCoupon;
exports.promotionActive = promotionActive;
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
exports.round2 = round2;
function discountAmount(kind, value, subtotal, maxDiscount = null) {
    let amount = kind === 'PERCENT' ? (subtotal * value) / 100 : value;
    if (maxDiscount != null)
        amount = Math.min(amount, maxDiscount);
    return (0, exports.round2)(Math.min(amount, subtotal));
}
function evaluateCoupon(coupon, subtotal, now) {
    if (!coupon.isActive)
        return { ok: false, reason: 'This coupon is not active' };
    if (coupon.validFrom && now < coupon.validFrom)
        return { ok: false, reason: 'This coupon is not valid yet' };
    if (coupon.validUntil && now > coupon.validUntil)
        return { ok: false, reason: 'This coupon has expired' };
    if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit)
        return { ok: false, reason: 'This coupon has been fully used' };
    if (subtotal < coupon.minOrderAmount)
        return {
            ok: false,
            reason: `Minimum order for this coupon is ${coupon.minOrderAmount}`,
        };
    const amount = discountAmount(coupon.kind, coupon.value, subtotal, coupon.maxDiscount);
    return amount > 0
        ? { ok: true, amount }
        : { ok: false, reason: 'This coupon gives no discount on this order' };
}
function promotionActive(p, day, minute) {
    return (p.isActive &&
        p.daysOfWeek.includes(day) &&
        minute >= p.startMinute &&
        minute < p.endMinute);
}
const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
};
exports.toMinutes = toMinutes;
const fromMinutes = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
exports.fromMinutes = fromMinutes;
//# sourceMappingURL=discounts.js.map