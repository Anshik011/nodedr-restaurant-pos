"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPrivateAddress = isPrivateAddress;
exports.netOptionsFromEnv = netOptionsFromEnv;
exports.resolveWebhookTarget = resolveWebhookTarget;
const promises_1 = require("node:dns/promises");
const node_net_1 = require("node:net");
function ipv4ToInt(ip) {
    return ip.split('.').reduce((acc, p) => acc * 256 + Number(p), 0);
}
const V4_BLOCKED = [
    ['0.0.0.0', 8],
    ['10.0.0.0', 8],
    ['100.64.0.0', 10],
    ['127.0.0.0', 8],
    ['169.254.0.0', 16],
    ['172.16.0.0', 12],
    ['192.0.0.0', 24],
    ['192.168.0.0', 16],
    ['198.18.0.0', 15],
    ['224.0.0.0', 4],
    ['240.0.0.0', 4],
];
function isPrivateAddress(ip) {
    const kind = (0, node_net_1.isIP)(ip);
    if (kind === 4) {
        const n = ipv4ToInt(ip);
        return V4_BLOCKED.some(([base, bits]) => {
            const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
            return (n & mask) >>> 0 === (ipv4ToInt(base) & mask) >>> 0;
        });
    }
    if (kind === 6) {
        const lower = ip.toLowerCase();
        const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
        if (mapped)
            return isPrivateAddress(mapped[1]);
        if (lower === '::' || lower === '::1')
            return true;
        if (/^f[cd]/.test(lower))
            return true;
        if (/^fe[89ab]/.test(lower))
            return true;
        if (/^ff/.test(lower))
            return true;
        return false;
    }
    return true;
}
function netOptionsFromEnv(env = process.env) {
    return {
        allowPrivate: env.WEBHOOKS_ALLOW_PRIVATE === 'true',
        allowInsecure: env.WEBHOOKS_ALLOW_INSECURE === 'true',
    };
}
async function resolveWebhookTarget(raw, opts, resolve = (h) => (0, promises_1.lookup)(h, { all: true })) {
    let url;
    try {
        url = new URL(raw);
    }
    catch {
        throw new Error('That is not a valid URL');
    }
    if (url.protocol !== 'https:' &&
        !(opts.allowInsecure && url.protocol === 'http:'))
        throw new Error('Webhook URLs must use https');
    if (url.username || url.password)
        throw new Error('Put credentials in the signature secret, not the URL');
    const host = url.hostname.replace(/^\[|\]$/g, '');
    const addresses = (0, node_net_1.isIP)(host)
        ? [{ address: host, family: (0, node_net_1.isIP)(host) }]
        : await resolve(host).catch(() => {
            throw new Error('Could not resolve that host');
        });
    if (addresses.length === 0)
        throw new Error('Could not resolve that host');
    if (!opts.allowPrivate && addresses.some((a) => isPrivateAddress(a.address)))
        throw new Error('That address points to a private or internal network');
    const first = addresses[0];
    return { url, address: first.address, family: first.family === 6 ? 6 : 4 };
}
//# sourceMappingURL=net-guard.js.map