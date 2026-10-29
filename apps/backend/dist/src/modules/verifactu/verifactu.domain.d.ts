export type VerifactuEnvironment = 'TEST' | 'PRODUCTION';
export declare const QR_HEADING = "QR tributario:";
export declare const QR_VERIFIABLE = "Factura verificable en la sede electr\u00F3nica de la AEAT";
export declare const QR_SHORT = "VERI*FACTU";
export declare const NS_INFO = "https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroInformacion.xsd";
export declare const NS_LR = "https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroLR.xsd";
export declare const IVA_RATES: readonly [0, 2, 4, 5, 7.5, 10, 21];
export interface InvoiceId {
    issuerNif: string;
    number: string;
    issueDate: string;
}
export interface BreakdownLine {
    rate: number;
    baseCents: number;
    quotaCents: number;
}
export interface SystemInfo {
    producerName: string;
    producerCountry: string;
    producerIdType: string;
    producerId: string;
    systemName: string;
    systemId: string;
    version: string;
    installationNumber: string;
}
export interface ChainRef extends InvoiceId {
    hash: string;
}
export interface AltaRecord {
    id: InvoiceId;
    issuerName: string;
    invoiceType: 'F2' | 'R5';
    description: string;
    breakdown: BreakdownLine[];
    taxTotalCents: number;
    totalCents: number;
    previous: ChainRef | null;
    system: SystemInfo;
    generatedAt: string;
    rectified?: InvoiceId[];
}
export interface CancelRecord {
    id: InvoiceId;
    previous: ChainRef | null;
    system: SystemInfo;
    generatedAt: string;
}
export declare function amount(cents: number): string;
export declare function madridParts(date: Date): {
    day: string;
    timestamp: string;
};
export declare function altaString(a: {
    id: InvoiceId;
    invoiceType: string;
    taxTotalCents: number;
    totalCents: number;
    previousHash: string;
    generatedAt: string;
}): string;
export declare function cancelString(c: {
    id: InvoiceId;
    previousHash: string;
    generatedAt: string;
}): string;
export declare function fingerprint(text: string): string;
export declare function altaHash(r: AltaRecord): string;
export declare function cancelHash(r: CancelRecord): string;
export declare function validateInvoiceNumber(n: string): void;
export declare function qrUrl(env: VerifactuEnvironment, id: InvoiceId, totalCents: number): string;
export declare function altaXml(r: AltaRecord): string;
export declare function cancelXml(c: CancelRecord): string;
export declare function envelope(issuerName: string, issuerNif: string, records: string[]): string;
export declare function soap(body: string): string;
export interface GrossLine {
    grossCents: number;
    ratePercent: number;
}
export declare function buildBreakdown(lines: GrossLine[], targetCents: number): {
    breakdown: BreakdownLine[];
    taxTotalCents: number;
    totalCents: number;
};
export declare function validateAlta(r: AltaRecord): void;
