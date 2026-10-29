"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_ATTEMPTS = exports.BACKOFF_MS = void 0;
exports.signPayload = signPayload;
exports.verifySignature = verifySignature;
const node_crypto_1 = require("node:crypto");
function signPayload(secret, body, nowSeconds) {
    const mac = (0, node_crypto_1.createHmac)('sha256', secret)
        .update(`${nowSeconds}.${body}`)
        .digest('hex');
    return `t=${nowSeconds},v1=${mac}`;
}
function verifySignature(secret, body, header, toleranceSeconds = 300, nowSeconds = Math.floor(Date.now() / 1000)) {
    const parts = {};
    for (const p of header.split(',')) {
        const i = p.indexOf('=');
        if (i > 0)
            parts[p.slice(0, i)] = p.slice(i + 1);
    }
    const t = Number(parts.t);
    const v1 = parts.v1;
    if (!Number.isFinite(t) || !v1)
        return false;
    if (Math.abs(nowSeconds - t) > toleranceSeconds)
        return false;
    const expected = (0, node_crypto_1.createHmac)('sha256', secret)
        .update(`${t}.${body}`)
        .digest('hex');
    const a = Buffer.from(expected);
    const b = Buffer.from(v1);
    return a.length === b.length && (0, node_crypto_1.timingSafeEqual)(a, b);
}
exports.BACKOFF_MS = [
    60_000,
    5 * 60_000,
    30 * 60_000,
    2 * 3600_000,
    12 * 3600_000,
];
exports.MAX_ATTEMPTS = exports.BACKOFF_MS.length + 1;
//# sourceMappingURL=signing.js.map