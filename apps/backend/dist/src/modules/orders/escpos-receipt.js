"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveProfile = void 0;
exports.discountLabel = discountLabel;
exports.buildReceiptEscPosJob = buildReceiptEscPosJob;
exports.buildKotEscPosJob = buildKotEscPosJob;
exports.buildReceiptEscPos = buildReceiptEscPos;
exports.buildKotEscPos = buildKotEscPos;
exports.buildOpenDrawer = buildOpenDrawer;
exports.buildTestSlip = buildTestSlip;
exports.buildKotTestSlip = buildKotTestSlip;
const types_1 = require("@nodedr-restaurant/types");
const encoder_1 = require("./escpos/encoder");
var encoder_2 = require("./escpos/encoder");
Object.defineProperty(exports, "resolveProfile", { enumerable: true, get: function () { return encoder_2.resolveProfile; } });
const CURRENCY_SYMBOLS = {
    INR: ['Rs.', 'Rs.'],
    USD: ['$', 'USD '],
    EUR: ['\u20ac', 'EUR '],
    GBP: ['\u00a3', 'GBP '],
};
function currencySymbol(w, currency) {
    const [preferred, fallback] = CURRENCY_SYMBOLS[currency] ?? [
        `${currency} `,
        `${currency} `,
    ];
    return [...preferred].every((c) => w.has(c)) ? preferred : fallback;
}
function discountLabel(percent) {
    return percent && percent > 0 ? `Discount (${Number(percent)}%)` : 'Discount';
}
const stamp = (d, f) => new Date(d).toLocaleString(f.locale, { timeZone: f.timeZone });
function buildReceiptEscPosJob({ restaurantName, branch, currency, order, openDrawer = false, profile = (0, encoder_1.resolveProfile)(), timeZone, locale, }) {
    const w = new encoder_1.EscposWriter(profile);
    const sym = currencySymbol(w, currency);
    const money = (n) => `${sym}${Number(n).toFixed(2)}`;
    const taxLabel = (0, types_1.resolveTaxLabel)(branch.taxRegime, branch.taxLabel);
    const taxIdValue = branch.taxId ||
        (branch.taxRegime === 'INDIA_GST' ? branch.gstNumber : null);
    const taxIdLabel = (0, types_1.resolveTaxIdLabel)(branch.taxRegime);
    w.text(restaurantName, { align: 'center', bold: true, size: 'big' });
    w.text(branch.name, { align: 'center' });
    if (branch.address)
        w.text(branch.address, { align: 'center' });
    if (branch.phone)
        w.text(`Ph: ${branch.phone}`, { align: 'center' });
    if (taxIdValue) {
        w.text(`${taxIdLabel}: ${taxIdValue}`, { align: 'center' });
    }
    w.rule();
    w.text(stamp(order.createdAt, { timeZone, locale }));
    w.text(`Order: #${order.orderNumber} - ${order.type.replace('_', ' ')}`);
    if (order.table)
        w.text(`Table: ${order.table.label}`);
    if (order.customer) {
        w.text(`Guest: ${order.customer.name}${order.customer.phone ? ` - ${order.customer.phone}` : ''}`);
    }
    w.rule();
    for (const item of order.items) {
        w.text(item.nameSnapshot, { bold: true });
        for (const mod of item.modifiers)
            w.text(`  + ${mod.nameSnapshot}`);
        w.row(`${item.quantity} x ${money(item.unitPriceSnapshot)}`, money(item.lineTotal), { indent: 2 });
        if (Number(item.taxRateSnapshot) > 0) {
            w.text(`  ${taxLabel} @ ${item.taxRateSnapshot}%`);
        }
    }
    w.rule();
    if (branch.taxMode === 'EXCLUSIVE') {
        w.row('Subtotal', money(order.subtotal - order.taxAmount));
        if (order.discountAmount > 0) {
            w.row(discountLabel(order.discountPercent), `-${money(order.discountAmount)}`);
        }
        if (order.taxAmount > 0)
            w.row(taxLabel, money(order.taxAmount));
    }
    else {
        w.row('Subtotal', money(order.subtotal));
        if (order.discountAmount > 0) {
            w.row(discountLabel(order.discountPercent), `-${money(order.discountAmount)}`);
        }
        if (order.taxAmount > 0) {
            if (types_1.TAX_REGIME_PRESETS[branch.taxRegime].splitCgstSgst) {
                const half = Math.round((order.taxAmount / 2 + Number.EPSILON) * 100) / 100;
                w.row('CGST (incl.)', money(half));
                w.row('SGST (incl.)', money(order.taxAmount - half));
            }
            else {
                w.row(`${taxLabel} (incl.)`, money(order.taxAmount));
            }
        }
    }
    if (order.loyaltyDiscountAmount > 0) {
        w.row(`Loyalty (${order.loyaltyPointsRedeemed} pts)`, `-${money(order.loyaltyDiscountAmount)}`);
    }
    if (order.tipAmount > 0)
        w.row('Tip', money(order.tipAmount));
    w.rule();
    w.row(order.isProvisional ? 'TOTAL DUE' : 'TOTAL', money(order.totalAmount), {
        bold: true,
        size: 'tall',
    });
    if (order.payments.length > 0) {
        w.rule();
        for (const p of order.payments) {
            w.row(`Paid (${p.method})`, money(p.amount));
            if (p.tendered != null && p.changeGiven != null && p.changeGiven > 0) {
                w.row(`  Received`, money(p.tendered));
                w.row(`  Change`, money(p.changeGiven));
            }
        }
    }
    if (order.amountPaid !== undefined && order.balanceDue !== undefined) {
        w.rule();
        w.row('Amount paid', money(order.amountPaid));
        w.row('Balance due', money(order.balanceDue), { bold: true });
    }
    if (order.verifactu && !order.isProvisional) {
        w.rule();
        w.text(`Factura simplificada ${order.verifactu.invoiceNumber}`, {
            align: 'center',
            bold: true,
        });
        w.text(order.verifactu.heading, { align: 'center' });
        w.qr(order.verifactu.url);
        w.text(order.verifactu.legend, { align: 'center' });
        w.text(order.verifactu.short, { align: 'center', bold: true });
    }
    w.rule();
    w.text(order.isProvisional
        ? 'Bill only - not a receipt. Payment pending.'
        : 'Thank you! Visit again.', { align: 'center' });
    return {
        buffer: w.finish({ drawer: openDrawer }),
        unsupportedChars: [...w.unsupported],
    };
}
function buildKotEscPosJob({ branchName, order, ticket, profile = (0, encoder_1.resolveProfile)(), timeZone, locale, }) {
    const w = new encoder_1.EscposWriter(profile);
    w.text('KITCHEN ORDER', { align: 'center', bold: true, size: 'tall' });
    if (ticket?.reprint) {
        w.text(`*** REPRINT #${ticket.reprint} ***`, {
            align: 'center',
            bold: true,
            size: 'tall',
        });
    }
    w.text(branchName, { align: 'center' });
    if (ticket) {
        w.text(`Ticket ${ticket.number}${ticket.station ? ` - ${ticket.station}` : ''}`, { align: 'center' });
    }
    w.rule();
    w.text(`#${order.orderNumber}`, { bold: true, size: 'big' });
    w.text(`${order.type.replace('_', ' ')}${order.table ? ` - Table ${order.table.label}` : ''}`, { bold: true, size: 'tall' });
    if (order.customer)
        w.text(`Guest: ${order.customer.name}`);
    w.text(stamp(order.createdAt, { timeZone, locale }));
    if (order.notes)
        w.text(`ORDER NOTE: ${order.notes}`, { bold: true });
    w.rule('=');
    let units = 0;
    for (const item of order.items) {
        units += item.quantity;
        w.text(`${item.quantity} x ${item.nameSnapshot}`, {
            bold: true,
            size: 'tall',
        });
        for (const mod of item.modifiers)
            w.text(`    + ${mod.nameSnapshot}`);
        if (item.kitchenNote) {
            w.text(`    NOTE: ${item.kitchenNote}`, { bold: true });
        }
        w.blank();
    }
    w.rule('=');
    w.text(`${order.items.length} line(s), ${units} item(s)`);
    return {
        buffer: w.finish(),
        unsupportedChars: [...w.unsupported],
    };
}
function buildReceiptEscPos(args) {
    return buildReceiptEscPosJob(args).buffer;
}
function buildKotEscPos(args) {
    return buildKotEscPosJob(args).buffer;
}
function buildOpenDrawer() {
    return Buffer.concat([encoder_1.CMD.init, encoder_1.CMD.openDrawer]);
}
function buildTestSlip(profile = (0, encoder_1.resolveProfile)()) {
    const w = new encoder_1.EscposWriter(profile);
    w.text('Uptoware Restaurant ERP', { align: 'center', bold: true, size: 'big' });
    w.text('Printer test OK', { align: 'center' });
    w.rule();
    const ruler = '1234567890'.repeat(7).slice(0, profile.columns);
    w.text(ruler);
    w.text(`${profile.paperWidthMm} mm - ${profile.columns} columns - ${profile.codepage}`);
    w.text('Accents: \u00e1\u00e9\u00ed\u00f3\u00fa \u00f1 \u00fc \u00bf? \u00a1! \u20ac \u00a3');
    w.text('Bold', { bold: true });
    w.text('Tall text', { size: 'tall' });
    w.text('Wide text', { size: 'wide' });
    w.text(stamp(new Date(), {}));
    return w.finish();
}
function buildKotTestSlip(profile = (0, encoder_1.resolveProfile)(), branchName = 'Test print') {
    return buildKotEscPosJob({
        branchName,
        profile,
        ticket: { number: 'TEST-1', station: 'Kitchen' },
        order: {
            orderNumber: 'TEST',
            type: 'DINE_IN',
            createdAt: new Date(),
            table: { label: '1' },
            customer: null,
            notes: 'This is only a test - no food to make',
            items: [
                {
                    nameSnapshot: 'Sample dish',
                    quantity: 2,
                    kitchenNote: 'No onion',
                    modifiers: [{ nameSnapshot: 'Extra spicy' }],
                },
            ],
        },
    });
}
//# sourceMappingURL=escpos-receipt.js.map