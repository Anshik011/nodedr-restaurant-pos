"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.csvCell = csvCell;
exports.toCsv = toCsv;
const FORMULA_START = /^[=+\-@\t\r]/;
function csvCell(value) {
    if (value == null)
        return '';
    let s;
    if (value instanceof Date)
        s = value.toISOString();
    else if (typeof value === 'string')
        s = FORMULA_START.test(value) ? `'${value}` : value;
    else
        s = String(value);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function toCsv(columns, rows) {
    const lines = [columns, ...rows].map((r) => r.map(csvCell).join(','));
    return '﻿' + lines.join('\r\n') + '\r\n';
}
//# sourceMappingURL=csv.js.map