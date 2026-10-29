export declare function signPayload(secret: string, body: string, nowSeconds: number): string;
export declare function verifySignature(secret: string, body: string, header: string, toleranceSeconds?: number, nowSeconds?: number): boolean;
export declare const BACKOFF_MS: number[];
export declare const MAX_ATTEMPTS: number;
