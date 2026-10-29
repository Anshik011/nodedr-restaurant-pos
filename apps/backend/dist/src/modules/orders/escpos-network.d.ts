export interface NetworkPrinterTarget {
    host: string;
    port: number;
}
export declare function sendViaNetwork(target: NetworkPrinterTarget, buffer: Buffer): Promise<void>;
export declare function probeNetworkPrinter(target: NetworkPrinterTarget): Promise<{
    reachable: boolean;
    error: string | null;
}>;
