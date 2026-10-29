export declare class PrinterNotFoundError extends Error {
    code: string;
    constructor(message: string);
}
export declare function probeCharDevices(): Promise<string[]>;
export declare function findPrinterDescriptor(): {
    vendorId: number;
    productId: number;
    id: string;
} | null;
export declare function sendRaw(buffer: Buffer): Promise<void>;
