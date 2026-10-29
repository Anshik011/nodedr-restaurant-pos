"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.round2 = round2;
exports.round3 = round3;
exports.round4 = round4;
function round2(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}
function round3(value) {
    return Math.round((value + Number.EPSILON) * 1000) / 1000;
}
function round4(value) {
    return Math.round((value + Number.EPSILON) * 10000) / 10000;
}
//# sourceMappingURL=money.js.map