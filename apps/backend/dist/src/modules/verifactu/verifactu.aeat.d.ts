import { type VerifactuEnvironment } from './verifactu.domain';
export declare const AEAT_ENDPOINT: Record<VerifactuEnvironment, string>;
export interface AeatLine {
    issuerNif: string;
    number: string;
    issueDate: string;
    operation: string;
    state: string;
    errorCode: string;
    errorText: string;
}
export interface AeatResponse {
    csv: string;
    state: string;
    waitSeconds: number;
    lines: AeatLine[];
    raw: string;
}
export declare class AeatFault extends Error {
    readonly code: string;
    constructor(code: string, message: string);
}
export type AeatSender = (env: VerifactuEnvironment, pfx: Buffer, passphrase: string, body: string) => Promise<AeatResponse>;
export declare function inspectCertificate(p12: Buffer, password: string): {
    subject: string;
    expiresAt: Date;
};
export declare function parseResponse(status: number, raw: string): AeatResponse;
export declare function postSoap(endpoint: string, pfx: Buffer, passphrase: string, body: string, trust?: {
    ca: string;
}): Promise<AeatResponse>;
export declare const sendToAeat: AeatSender;
