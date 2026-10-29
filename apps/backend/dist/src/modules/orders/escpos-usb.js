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
exports.PrinterNotFoundError = void 0;
exports.probeCharDevices = probeCharDevices;
exports.findPrinterDescriptor = findPrinterDescriptor;
exports.sendRaw = sendRaw;
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
let usbModule;
function getUsb() {
    if (usbModule === undefined) {
        try {
            usbModule = require('usb');
        }
        catch {
            usbModule = null;
        }
    }
    return usbModule;
}
const PRINTER_INTERFACE_CLASS = 7;
const USBLP_MAJOR = 180;
class PrinterNotFoundError extends Error {
    code = 'PRINTER_NOT_FOUND';
    constructor(message) {
        super(message);
        this.name = 'PrinterNotFoundError';
    }
}
exports.PrinterNotFoundError = PrinterNotFoundError;
function candidateLpPaths() {
    const paths = [];
    for (let i = 0; i < 4; i++)
        paths.push(`/dev/usb/lp${i}`, `/dev/usblp${i}`);
    return paths;
}
function usableLpPaths() {
    const existing = candidateLpPaths().filter((p) => {
        try {
            return fs.statSync(p).isCharacterDevice();
        }
        catch {
            return false;
        }
    });
    if (existing.length > 0)
        return existing;
    const made = [];
    try {
        fs.mkdirSync('/dev/usb', { recursive: true });
        for (let minor = 0; minor < 4; minor++) {
            const target = `/dev/usb/lp${minor}`;
            try {
                (0, child_process_1.execFileSync)('mknod', [
                    '-m',
                    '660',
                    target,
                    'c',
                    String(USBLP_MAJOR),
                    String(minor),
                ]);
                made.push(target);
            }
            catch {
            }
        }
    }
    catch {
    }
    return made;
}
const CHAR_WRITE_TIMEOUT_MS = 8000;
function withTimeout(promise, ms, label) {
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Timed out writing to ${label} — printer not responding`)), ms);
    });
    return Promise.race([promise.finally(() => clearTimeout(timer)), timeout]);
}
async function sendViaCharDevice(buffer) {
    const paths = usableLpPaths();
    let lastRealError = null;
    for (const path of paths) {
        let handle;
        try {
            handle = await fs.promises.open(path, 'w');
        }
        catch (err) {
            const code = err.code;
            if (code && ['ENODEV', 'ENXIO', 'ENOENT', 'EACCES'].includes(code))
                continue;
            lastRealError = err;
            continue;
        }
        try {
            let offset = 0;
            while (offset < buffer.length) {
                const { bytesWritten } = await withTimeout(handle.write(buffer, offset, buffer.length - offset), CHAR_WRITE_TIMEOUT_MS, path);
                if (bytesWritten <= 0)
                    break;
                offset += bytesWritten;
            }
            return true;
        }
        finally {
            await handle.close().catch(() => { });
        }
    }
    if (lastRealError)
        throw lastRealError;
    return false;
}
async function probeCharDevices() {
    const out = [];
    for (const path of usableLpPaths()) {
        let handle;
        try {
            handle = await fs.promises.open(path, 'w');
            out.push(path);
        }
        catch {
        }
        finally {
            if (handle)
                await handle.close().catch(() => { });
        }
    }
    return out;
}
function findPrinterInterface() {
    const usb = getUsb();
    if (!usb)
        return null;
    for (const device of usb.getDeviceList()) {
        let opened = false;
        try {
            device.open();
            opened = true;
            const iface = (device.interfaces || []).find((i) => i.descriptor.bInterfaceClass === PRINTER_INTERFACE_CLASS);
            if (iface)
                return { device, iface };
            device.close();
        }
        catch {
            if (opened) {
                try {
                    device.close();
                }
                catch {
                }
            }
        }
    }
    return null;
}
function detachKernelDriver(iface) {
    try {
        if (iface.isKernelDriverActive()) {
            iface.detachKernelDriver();
            return true;
        }
    }
    catch {
    }
    return false;
}
async function sendViaLibusb(buffer) {
    const found = findPrinterInterface();
    if (!found)
        return false;
    const { device, iface } = found;
    const reattach = detachKernelDriver(iface);
    try {
        try {
            iface.claim();
        }
        catch (err) {
            if (/LIBUSB_ERROR_BUSY|EBUSY|resource busy/i.test(String(err?.message))) {
                throw new PrinterNotFoundError('The USB printer is busy — another program (or the OS print queue) is using it. Close it and try again.');
            }
            throw err;
        }
        const outEndpoint = iface.endpoints.find((e) => e.direction === 'out');
        if (!outEndpoint) {
            throw new Error('USB printer has no OUT endpoint on its printer-class interface');
        }
        outEndpoint.timeout = 5000;
        await outEndpoint.transferAsync(buffer);
    }
    finally {
        await new Promise((resolve) => iface.release(true, () => resolve()));
        if (reattach) {
            try {
                iface.attachKernelDriver();
            }
            catch {
            }
        }
        try {
            device.close();
        }
        catch {
        }
    }
    return true;
}
function findPrinterDescriptor() {
    const found = findPrinterInterface();
    if (!found)
        return null;
    const d = found.device.deviceDescriptor;
    try {
        found.device.close();
    }
    catch {
    }
    return {
        vendorId: d.idVendor,
        productId: d.idProduct,
        id: `${d.idVendor.toString(16).padStart(4, '0')}:${d.idProduct.toString(16).padStart(4, '0')}`,
    };
}
async function sendRaw(buffer) {
    let charDeviceError = null;
    try {
        if (await sendViaCharDevice(buffer))
            return;
    }
    catch (err) {
        charDeviceError = err;
    }
    if (await sendViaLibusb(buffer))
        return;
    if (charDeviceError) {
        throw new PrinterNotFoundError('Found a printer device but could not write to it. Check it is powered on, has paper, and is connected.');
    }
    throw new PrinterNotFoundError('No USB printer found. Check it is powered on, connected, and not in use by another app.');
}
//# sourceMappingURL=escpos-usb.js.map