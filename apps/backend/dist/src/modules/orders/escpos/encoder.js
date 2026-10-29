"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EscposWriter = exports.CMD = exports.CODEPAGE_NAMES = exports.DEFAULT_COLUMNS = void 0;
exports.resolveProfile = resolveProfile;
const codepages_1 = require("./codepages");
exports.DEFAULT_COLUMNS = { 58: 32, 80: 48 };
exports.CODEPAGE_NAMES = Object.keys(codepages_1.CODEPAGES);
function resolveProfile(opts = {}) {
    const paperWidthMm = opts.paperWidthMm === 58 ? 58 : 80;
    const requested = Number(opts.columns);
    const columns = Number.isFinite(requested) && requested >= 20 && requested <= 64
        ? Math.floor(requested)
        : exports.DEFAULT_COLUMNS[paperWidthMm];
    const codepage = exports.CODEPAGE_NAMES.includes(opts.codepage)
        ? opts.codepage
        : 'CP858';
    return { paperWidthMm, columns, codepage };
}
const ESC = 0x1b;
const GS = 0x1d;
const SIZE_BYTE = {
    normal: 0x00,
    tall: 0x01,
    wide: 0x10,
    big: 0x11,
};
const ALIGN_BYTE = { left: 0, center: 1, right: 2 };
exports.CMD = {
    init: Buffer.from([ESC, 0x40]),
    fontA: Buffer.from([ESC, 0x4d, 0x00]),
    boldOn: Buffer.from([ESC, 0x45, 0x01]),
    boldOff: Buffer.from([ESC, 0x45, 0x00]),
    underlineOff: Buffer.from([ESC, 0x2d, 0x00]),
    sizeNormal: Buffer.from([GS, 0x21, 0x00]),
    alignLeft: Buffer.from([ESC, 0x61, 0x00]),
    invertOff: Buffer.from([GS, 0x42, 0x00]),
    openDrawer: Buffer.from([ESC, 0x70, 0x00, 0x19, 0xfa]),
    cut: Buffer.from([GS, 0x56, 0x00]),
};
const LOOKALIKES = {
    '‘': "'",
    '’': "'",
    '“': '"',
    '”': '"',
    '–': '-',
    '—': '-',
    '…': '...',
    '•': '*',
    '₹': 'Rs.',
    ' ': ' ',
};
class EscposWriter {
    profile;
    unsupported = new Set();
    chunks = [];
    reverse = new Map();
    constructor(profile) {
        this.profile = profile;
        const high = [...codepages_1.CODEPAGES[profile.codepage].high];
        high.forEach((ch, i) => {
            if (ch !== '�')
                this.reverse.set(ch, 0x80 + i);
        });
        this.chunks.push(exports.CMD.init, Buffer.from([ESC, 0x74, codepages_1.CODEPAGES[profile.codepage].escposTable]), exports.CMD.fontA);
    }
    has(ch) {
        const cp = ch.codePointAt(0);
        return (cp >= 0x20 && cp <= 0x7e) || this.reverse.has(ch);
    }
    prepare(text) {
        let out = '';
        for (const ch of String(text ?? '')) {
            if (ch === '\t')
                out += ' ';
            else if (ch === '\n' || ch === '\r')
                out += ch === '\n' ? '\n' : '';
            else if (this.has(ch))
                out += ch;
            else if (LOOKALIKES[ch] !== undefined)
                out += LOOKALIKES[ch];
            else {
                const base = ch.normalize('NFKD').replace(/[̀-ͯ]/g, '');
                if (base && base !== ch && [...base].every((c) => this.has(c))) {
                    out += base;
                }
                else if (/\p{C}/u.test(ch)) {
                }
                else {
                    out += '?';
                    this.unsupported.add(ch);
                }
            }
        }
        return out;
    }
    encode(prepared) {
        const bytes = [];
        for (const ch of prepared) {
            const cp = ch.codePointAt(0);
            bytes.push(cp >= 0x20 && cp <= 0x7e ? cp : (this.reverse.get(ch) ?? 0x3f));
        }
        return Buffer.from(bytes);
    }
    columnsFor(size = 'normal') {
        return size === 'wide' || size === 'big'
            ? Math.floor(this.profile.columns / 2)
            : this.profile.columns;
    }
    wrap(text, columns) {
        const lines = [];
        for (const paragraph of this.prepare(text).split('\n')) {
            let line = '';
            for (const word of paragraph.split(' ').filter((w) => w.length > 0)) {
                let w = word;
                while (w.length > columns) {
                    if (line) {
                        lines.push(line);
                        line = '';
                    }
                    lines.push(w.slice(0, columns));
                    w = w.slice(columns);
                }
                const candidate = line ? `${line} ${w}` : w;
                if (candidate.length > columns) {
                    lines.push(line);
                    line = w;
                }
                else {
                    line = candidate;
                }
            }
            lines.push(line);
        }
        return lines;
    }
    emit(line, opts) {
        const { align = 'left', bold = false, size = 'normal' } = opts;
        const styled = bold || size !== 'normal' || align !== 'left';
        if (styled) {
            this.chunks.push(Buffer.from([ESC, 0x61, ALIGN_BYTE[align]]));
            if (bold)
                this.chunks.push(exports.CMD.boldOn);
            if (size !== 'normal') {
                this.chunks.push(Buffer.from([GS, 0x21, SIZE_BYTE[size]]));
            }
        }
        this.chunks.push(this.encode(line), Buffer.from('\n'));
        if (styled) {
            if (size !== 'normal')
                this.chunks.push(exports.CMD.sizeNormal);
            if (bold)
                this.chunks.push(exports.CMD.boldOff);
            this.chunks.push(exports.CMD.alignLeft);
        }
    }
    text(text, opts = {}) {
        for (const l of this.wrap(text, this.columnsFor(opts.size))) {
            this.emit(l, opts);
        }
        return this;
    }
    row(label, value, opts = {}) {
        const cols = this.columnsFor(opts.size);
        const v = this.prepare(value);
        const indent = ' '.repeat(opts.indent ?? 0);
        const room = Math.max(1, cols - v.length - 1 - indent.length);
        const parts = this.wrap(label, room);
        const lastIdx = parts.length - 1;
        parts.forEach((part, i) => {
            const left = indent + part;
            const line = i === lastIdx
                ? left + ' '.repeat(Math.max(1, cols - left.length - v.length)) + v
                : left;
            this.emit(line, opts);
        });
        return this;
    }
    qr(data, moduleSize = 6) {
        const bytes = Buffer.from(data, 'utf8');
        const len = bytes.length + 3;
        this.chunks.push(Buffer.from([ESC, 0x61, 1]), Buffer.from([GS, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00]), Buffer.from([GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, moduleSize]), Buffer.from([GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, 0x31]), Buffer.from([GS, 0x28, 0x6b, len & 0xff, len >> 8, 0x31, 0x50, 0x30]), bytes, Buffer.from([GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30]), Buffer.from('\n'), exports.CMD.alignLeft);
        return this;
    }
    rule(char = '-') {
        this.emit(char.repeat(this.profile.columns), {});
        return this;
    }
    blank(n = 1) {
        for (let i = 0; i < n; i++)
            this.emit('', {});
        return this;
    }
    finish(opts = {}) {
        if (this.unsupported.size > 0) {
            this.rule();
            this.text('(!) Some characters could not be printed and show as "?".');
        }
        this.chunks.push(exports.CMD.sizeNormal, exports.CMD.boldOff, exports.CMD.underlineOff, exports.CMD.invertOff, exports.CMD.alignLeft, Buffer.from('\n\n\n\n'));
        if (opts.cut !== false)
            this.chunks.push(exports.CMD.cut);
        if (opts.drawer)
            this.chunks.push(exports.CMD.openDrawer);
        return Buffer.concat(this.chunks);
    }
}
exports.EscposWriter = EscposWriter;
//# sourceMappingURL=encoder.js.map