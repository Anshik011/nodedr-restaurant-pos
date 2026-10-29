"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readJob = readJob;
const codepages_1 = require("./codepages");
function readJob(buf, codepage = 'CP858') {
    const high = [...codepages_1.CODEPAGES[codepage].high];
    const commands = [];
    const lines = [];
    let cur = '';
    for (let i = 0; i < buf.length;) {
        const b = buf[i];
        if (b === 0x1b) {
            const op = buf[i + 1];
            const len = op === 0x40 ? 2 : op === 0x70 ? 5 : 3;
            commands.push(buf.subarray(i, i + len).toString('hex'));
            i += len;
        }
        else if (b === 0x1d) {
            commands.push(buf.subarray(i, i + 3).toString('hex'));
            i += 3;
        }
        else if (b === 0x0a) {
            lines.push(cur);
            cur = '';
            i++;
        }
        else {
            cur += b < 0x80 ? String.fromCharCode(b) : high[b - 0x80];
            i++;
        }
    }
    if (cur)
        lines.push(cur);
    return { commands, lines, text: lines.join('\n') };
}
//# sourceMappingURL=read-job.js.map