"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToAeat = exports.AeatFault = exports.AEAT_ENDPOINT = void 0;
exports.inspectCertificate = inspectCertificate;
exports.parseResponse = parseResponse;
exports.postSoap = postSoap;
const https = __importStar(require("node:https"));
const node_forge_1 = __importDefault(require("node-forge"));
const verifactu_domain_1 = require("./verifactu.domain");
exports.AEAT_ENDPOINT = {
    TEST: 'https://prewww1.aeat.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/VerifactuSOAP',
    PRODUCTION: 'https://www1.agenciatributaria.gob.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/VerifactuSOAP',
};
class AeatFault extends Error {
    code;
    constructor(code, message) {
        super(`aeat: ${code}: ${message}`);
        this.code = code;
    }
}
exports.AeatFault = AeatFault;
function inspectCertificate(p12, password) {
    try {
        const asn1 = node_forge_1.default.asn1.fromDer(p12.toString('binary'));
        const p = node_forge_1.default.pkcs12.pkcs12FromAsn1(asn1, false, password);
        const bags = p.getBags({ bagType: node_forge_1.default.pki.oids.certBag })[node_forge_1.default.pki.oids.certBag] ??
            [];
        const key = (p.getBags({ bagType: node_forge_1.default.pki.oids.pkcs8ShroudedKeyBag })[node_forge_1.default.pki.oids.pkcs8ShroudedKeyBag] ?? []).length +
            (p.getBags({ bagType: node_forge_1.default.pki.oids.keyBag })[node_forge_1.default.pki.oids.keyBag] ??
                []).length;
        const cert = bags.map((b) => b.cert).find((c) => c);
        if (!cert || key === 0)
            throw new Error('no certificate with a private key found');
        const subject = cert.subject.attributes
            .map((a) => `${a.shortName ?? a.name}=${String(a.value)}`)
            .join(', ');
        return { subject, expiresAt: cert.validity.notAfter };
    }
    catch (e) {
        throw new Error(`Cannot read the certificate (wrong password or not a .p12/.pfx file): ${e.message}`);
    }
}
const tag = (xml, name) => {
    const m = new RegExp(`<(?:[A-Za-z0-9_]+:)?${name}(?:\\s[^>]*)?>([\\s\\S]*?)</(?:[A-Za-z0-9_]+:)?${name}>`).exec(xml);
    return m ? m[1].replace(/<[^>]+>/g, '').trim() : '';
};
const blocks = (xml, name) => [
    ...xml.matchAll(new RegExp(`<(?:[A-Za-z0-9_]+:)?${name}(?:\\s[^>]*)?>[\\s\\S]*?</(?:[A-Za-z0-9_]+:)?${name}>`, 'g')),
].map((m) => m[0]);
const unescapeXml = (s) => s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
const snippet = (s) => {
    const t = s.split(/\s+/).join(' ');
    return t.length > 300 ? `${t.slice(0, 300)}…` : t;
};
function parseResponse(status, raw) {
    if (/Fault/.test(raw)) {
        const code = tag(raw, 'faultcode');
        const message = tag(raw, 'faultstring');
        if (code || message)
            throw new AeatFault(code, unescapeXml(message));
    }
    const state = tag(raw, 'EstadoEnvio');
    if (!state) {
        if (status >= 400)
            throw new Error(`aeat: HTTP ${status}: ${snippet(raw)}`);
        throw new Error(`aeat: unexpected response (HTTP ${status}): ${snippet(raw)}`);
    }
    const lines = blocks(raw, 'RespuestaLinea').map((b) => ({
        issuerNif: tag(b, 'IDEmisorFactura'),
        number: unescapeXml(tag(b, 'NumSerieFactura')),
        issueDate: tag(b, 'FechaExpedicionFactura'),
        operation: tag(b, 'TipoOperacion'),
        state: tag(b, 'EstadoRegistro'),
        errorCode: tag(b, 'CodigoErrorRegistro'),
        errorText: unescapeXml(tag(b, 'DescripcionErrorRegistro')),
    }));
    return {
        csv: tag(raw, 'CSV'),
        state,
        waitSeconds: Number(tag(raw, 'TiempoEsperaEnvio')) || 0,
        lines,
        raw,
    };
}
function postSoap(endpoint, pfx, passphrase, body, trust) {
    return new Promise((resolve, reject) => {
        const url = new URL(endpoint);
        const payload = Buffer.from((0, verifactu_domain_1.soap)(body), 'utf8');
        const req = https.request({
            method: 'POST',
            hostname: url.hostname,
            path: url.pathname,
            port: url.port || 443,
            pfx,
            passphrase,
            ca: trust?.ca,
            minVersion: 'TLSv1.2',
            timeout: 90_000,
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                SOAPAction: '',
                'Content-Length': payload.length,
            },
        }, (res) => {
            const chunks = [];
            let size = 0;
            res.on('data', (c) => {
                size += c.length;
                if (size > 8 << 20)
                    req.destroy(new Error('aeat: response too large'));
                else
                    chunks.push(c);
            });
            res.on('end', () => {
                try {
                    resolve(parseResponse(res.statusCode ?? 0, Buffer.concat(chunks).toString('utf8')));
                }
                catch (e) {
                    reject(e instanceof Error ? e : new Error(String(e)));
                }
            });
        });
        req.on('timeout', () => req.destroy(new Error('aeat: timed out')));
        req.on('error', (e) => reject(new Error(`aeat: contacting the tax agency: ${e.message}`)));
        req.end(payload);
    });
}
const sendToAeat = (env, pfx, passphrase, body) => postSoap(exports.AEAT_ENDPOINT[env], pfx, passphrase, body);
exports.sendToAeat = sendToAeat;
//# sourceMappingURL=verifactu.aeat.js.map