"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stepAt = exports.STEP_SECONDS = void 0;
exports.base32Encode = base32Encode;
exports.base32Decode = base32Decode;
exports.generateSecret = generateSecret;
exports.hotp = hotp;
exports.verifyTotp = verifyTotp;
exports.otpauthUrl = otpauthUrl;
exports.sealSecret = sealSecret;
exports.openSecret = openSecret;
exports.generateRecoveryCode = generateRecoveryCode;
const node_crypto_1 = require("node:crypto");
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
exports.STEP_SECONDS = 30;
function base32Encode(buf) {
    let bits = 0;
    let value = 0;
    let out = '';
    for (const byte of buf) {
        value = (value << 8) | byte;
        bits += 8;
        while (bits >= 5) {
            out += B32[(value >>> (bits - 5)) & 31];
            bits -= 5;
        }
    }
    if (bits > 0)
        out += B32[(value << (5 - bits)) & 31];
    return out;
}
function base32Decode(text) {
    const clean = text.replace(/[\s=-]/g, '').toUpperCase();
    let bits = 0;
    let value = 0;
    const out = [];
    for (const ch of clean) {
        const idx = B32.indexOf(ch);
        if (idx < 0)
            throw new Error('Invalid base32 character');
        value = (value << 5) | idx;
        bits += 5;
        if (bits >= 8) {
            out.push((value >>> (bits - 8)) & 255);
            bits -= 8;
        }
    }
    return Buffer.from(out);
}
function generateSecret() {
    return base32Encode((0, node_crypto_1.randomBytes)(20));
}
function hotp(secret, counter, digits = 6) {
    const msg = Buffer.alloc(8);
    msg.writeBigUInt64BE(BigInt(counter));
    const h = (0, node_crypto_1.createHmac)('sha1', secret).update(msg).digest();
    const offset = h[h.length - 1] & 0x0f;
    const code = ((h[offset] & 0x7f) << 24) |
        (h[offset + 1] << 16) |
        (h[offset + 2] << 8) |
        h[offset + 3];
    return String(code % 10 ** digits).padStart(digits, '0');
}
const stepAt = (ms) => Math.floor(ms / 1000 / exports.STEP_SECONDS);
exports.stepAt = stepAt;
function verifyTotp(secretBase32, code, nowMs = Date.now(), window = 1) {
    if (!/^\d{6}$/.test(code))
        return null;
    const secret = base32Decode(secretBase32);
    const current = (0, exports.stepAt)(nowMs);
    for (let w = -window; w <= window; w++) {
        const expected = hotp(secret, current + w);
        if ((0, node_crypto_1.timingSafeEqual)(Buffer.from(expected), Buffer.from(code)))
            return current + w;
    }
    return null;
}
function otpauthUrl(secret, account, issuer) {
    const label = encodeURIComponent(`${issuer}:${account}`);
    return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=${exports.STEP_SECONDS}`;
}
const keyFrom = (material) => (0, node_crypto_1.createHash)('sha256').update(`2fa-secret:${material}`).digest();
function sealSecret(secret, keyMaterial) {
    const iv = (0, node_crypto_1.randomBytes)(12);
    const c = (0, node_crypto_1.createCipheriv)('aes-256-gcm', keyFrom(keyMaterial), iv);
    const ct = Buffer.concat([c.update(secret, 'utf8'), c.final()]);
    return ['v1', iv, c.getAuthTag(), ct]
        .map((p) => (typeof p === 'string' ? p : p.toString('base64url')))
        .join('.');
}
function openSecret(sealed, keyMaterial) {
    const [v, iv, tag, ct] = sealed.split('.');
    if (v !== 'v1' || !iv || !tag || !ct)
        throw new Error('Bad sealed secret');
    const d = (0, node_crypto_1.createDecipheriv)('aes-256-gcm', keyFrom(keyMaterial), Buffer.from(iv, 'base64url'));
    d.setAuthTag(Buffer.from(tag, 'base64url'));
    return Buffer.concat([
        d.update(Buffer.from(ct, 'base64url')),
        d.final(),
    ]).toString('utf8');
}
function generateRecoveryCode() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = (0, node_crypto_1.randomBytes)(12);
    const chars = [...bytes].map((b) => alphabet[b % alphabet.length]).join('');
    return `${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8, 12)}`;
}
//# sourceMappingURL=totp.js.map