"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToBranchPrinter = sendToBranchPrinter;
const escpos_network_1 = require("./escpos-network");
const escpos_usb_1 = require("./escpos-usb");
async function sendToBranchPrinter(branch, buffer) {
    if (branch.printerConnection === 'NETWORK') {
        if (!branch.printerHost) {
            throw new escpos_usb_1.PrinterNotFoundError('Network printing is selected but no printer address is set - add it in Settings > Printer');
        }
        return (0, escpos_network_1.sendViaNetwork)({ host: branch.printerHost, port: branch.printerPort }, buffer);
    }
    return (0, escpos_usb_1.sendRaw)(buffer);
}
//# sourceMappingURL=printer-transport.js.map