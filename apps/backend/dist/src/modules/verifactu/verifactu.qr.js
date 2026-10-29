"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.qrSvg = qrSvg;
const qrcode_1 = __importDefault(require("qrcode"));
function qrSvg(data, size) {
    const qr = qrcode_1.default.create(data, { errorCorrectionLevel: 'M' });
    const n = qr.modules.size;
    const cells = [];
    for (let y = 0; y < n; y += 1) {
        for (let x = 0; x < n; x += 1) {
            if (qr.modules.get(x, y))
                cells.push(`M${x},${y}h1v1h-1z`);
        }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}" width="${size}" height="${size}" shape-rendering="crispEdges" role="img" aria-label="QR tributario"><path d="${cells.join('')}" fill="#000"/></svg>`;
}
//# sourceMappingURL=verifactu.qr.js.map