export interface BranchPrinterTarget {
    printerConnection: string;
    printerHost: string | null;
    printerPort: number;
}
export declare function sendToBranchPrinter(branch: BranchPrinterTarget, buffer: Buffer): Promise<void>;
