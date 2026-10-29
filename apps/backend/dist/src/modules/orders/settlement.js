"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeBill = computeBill;
exports.discountPercentOf = discountPercentOf;
exports.manualDiscountEntry = manualDiscountEntry;
exports.settlePayments = settlePayments;
const common_1 = require("@nestjs/common");
const pricing_1 = require("./pricing");
function computeBill(input) {
    const totals = (0, pricing_1.computeOrderTotals)(input.lines, input.discountPercent ?? 0, (input.discountFlat ?? 0) + (input.autoDiscount ?? 0));
    const loyaltyDiscountAmount = (0, pricing_1.round2)(Math.min(Math.max(input.loyaltyDiscountRequested ?? 0, 0), totals.totalAmount));
    const tipAmount = (0, pricing_1.round2)(input.tip ?? 0);
    const deliveryFee = (0, pricing_1.round2)(input.deliveryFee ?? 0);
    const taxAmount = totals.subtotal > 0
        ? (0, pricing_1.round2)((totals.taxAmount * (totals.subtotal - totals.discountAmount)) /
            totals.subtotal)
        : 0;
    return {
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        discountPercent: discountPercentOf(totals.subtotal, totals.discountAmount),
        taxAmount,
        loyaltyDiscountAmount,
        tipAmount,
        deliveryFee,
        totalDue: (0, pricing_1.round2)(totals.totalAmount - loyaltyDiscountAmount + tipAmount + deliveryFee),
    };
}
function discountPercentOf(subtotal, discountAmount) {
    if (subtotal <= 0 || discountAmount <= 0)
        return 0;
    return (0, pricing_1.round2)((discountAmount / subtotal) * 100);
}
function manualDiscountEntry(percent, flat) {
    if (percent > 0)
        return { type: 'PERCENT', value: (0, pricing_1.round2)(percent) };
    if (flat > 0)
        return { type: 'FIXED', value: (0, pricing_1.round2)(flat) };
    return null;
}
function settlePayments(args) {
    const balance = (0, pricing_1.round2)(args.balance);
    const giftCardApplied = (0, pricing_1.round2)(args.giftCardApplied ?? 0);
    const lines = args.payments.map((p) => {
        const amount = (0, pricing_1.round2)(p.amount);
        if (!(amount > 0)) {
            throw new common_1.BadRequestException('Each payment must be more than zero');
        }
        if (p.tendered !== undefined) {
            if (p.method !== 'CASH') {
                throw new common_1.BadRequestException('Only a cash payment can have an amount received');
            }
            const tendered = (0, pricing_1.round2)(p.tendered);
            if (tendered < amount) {
                throw new common_1.BadRequestException('The amount received cannot be less than the payment');
            }
            return {
                method: p.method,
                amount,
                tendered,
                changeGiven: (0, pricing_1.round2)(tendered - amount),
                reference: p.reference,
            };
        }
        return {
            method: p.method,
            amount,
            tendered: null,
            changeGiven: null,
            reference: p.reference,
        };
    });
    let excess = (0, pricing_1.round2)(lines.reduce((sum, l) => sum + l.amount, 0) + giftCardApplied - balance);
    if (excess > 0) {
        for (let i = lines.length - 1; i >= 0 && excess > 0; i--) {
            const line = lines[i];
            if (line.method !== 'CASH')
                continue;
            const take = Math.min(excess, line.amount);
            const handedOver = line.tendered ?? line.amount;
            line.amount = (0, pricing_1.round2)(line.amount - take);
            line.tendered = handedOver;
            line.changeGiven = (0, pricing_1.round2)(handedOver - line.amount);
            excess = (0, pricing_1.round2)(excess - take);
        }
        if (excess > 0) {
            throw new common_1.BadRequestException(`Payments exceed the amount due (${balance}) - only cash can be over-tendered`);
        }
    }
    const kept = lines.filter((l) => l.amount > 0);
    const paidNow = (0, pricing_1.round2)(kept.reduce((sum, l) => sum + l.amount, 0) + giftCardApplied);
    const balanceAfter = (0, pricing_1.round2)(balance - paidNow);
    const fullyPaid = balanceAfter <= 0;
    if (!fullyPaid && !args.allowPartial) {
        throw new common_1.BadRequestException(`Payments (${paidNow}) do not cover the total due (${balance})`);
    }
    if (!fullyPaid && paidNow <= 0) {
        throw new common_1.BadRequestException('Enter a payment to record');
    }
    return {
        payments: kept,
        paidNow,
        balanceAfter: Math.max(balanceAfter, 0),
        changeDue: (0, pricing_1.round2)(kept.reduce((sum, l) => sum + (l.changeGiven ?? 0), 0)),
        fullyPaid,
    };
}
//# sourceMappingURL=settlement.js.map