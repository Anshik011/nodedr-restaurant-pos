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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendViaNetwork = sendViaNetwork;
exports.probeNetworkPrinter = probeNetworkPrinter;
const net = __importStar(require("net"));
const escpos_usb_1 = require("./escpos-usb");
const CONNECT_TIMEOUT_MS = 4000;
const WRITE_TIMEOUT_MS = 8000;
function describe(target) {
    return `${target.host}:${target.port}`;
}
function sendViaNetwork(target, buffer) {
    return new Promise((resolve, reject) => {
        const socket = new net.Socket();
        let settled = false;
        const done = (err) => {
            if (settled)
                return;
            settled = true;
            socket.destroy();
            if (err)
                reject(err);
            else
                resolve();
        };
        socket.setTimeout(CONNECT_TIMEOUT_MS, () => done(new escpos_usb_1.PrinterNotFoundError(`Printer at ${describe(target)} did not answer - check it is on, on the same network as the server, and the address is right`)));
        socket.once('error', (err) => {
            const why = err.code === 'ECONNREFUSED'
                ? 'connection refused (is raw/9100 printing enabled on the printer?)'
                : err.code === 'EHOSTUNREACH' || err.code === 'ENETUNREACH'
                    ? 'host unreachable from the server'
                    : err.code === 'ENOTFOUND'
                        ? 'host name not found'
                        : err.message;
            done(new escpos_usb_1.PrinterNotFoundError(`Could not reach the printer at ${describe(target)}: ${why}`));
        });
        socket.connect(target.port, target.host, () => {
            socket.setTimeout(WRITE_TIMEOUT_MS, () => done(new Error(`Timed out sending to ${describe(target)} - printer not responding`)));
            socket.end(buffer, () => undefined);
            socket.once('close', () => done());
        });
    });
}
async function probeNetworkPrinter(target) {
    try {
        await sendViaNetwork(target, Buffer.alloc(0));
        return { reachable: true, error: null };
    }
    catch (err) {
        return {
            reachable: false,
            error: err instanceof Error ? err.message : 'Unreachable',
        };
    }
}
//# sourceMappingURL=escpos-network.js.map