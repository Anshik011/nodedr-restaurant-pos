import { type CodepageName } from './codepages';
export type { CodepageName } from './codepages';
export type PaperWidthMm = 58 | 80;
export type TextSize = 'normal' | 'tall' | 'wide' | 'big';
export type Align = 'left' | 'center' | 'right';
export interface PrinterProfile {
    paperWidthMm: PaperWidthMm;
    columns: number;
    codepage: CodepageName;
}
export declare const DEFAULT_COLUMNS: Record<PaperWidthMm, number>;
export declare const CODEPAGE_NAMES: CodepageName[];
export declare function resolveProfile(opts?: {
    paperWidthMm?: number | null;
    columns?: number | null;
    codepage?: string | null;
}): PrinterProfile;
export declare const CMD: {
    init: Buffer<ArrayBuffer>;
    fontA: Buffer<ArrayBuffer>;
    boldOn: Buffer<ArrayBuffer>;
    boldOff: Buffer<ArrayBuffer>;
    underlineOff: Buffer<ArrayBuffer>;
    sizeNormal: Buffer<ArrayBuffer>;
    alignLeft: Buffer<ArrayBuffer>;
    invertOff: Buffer<ArrayBuffer>;
    openDrawer: Buffer<ArrayBuffer>;
    cut: Buffer<ArrayBuffer>;
};
export declare class EscposWriter {
    readonly profile: PrinterProfile;
    readonly unsupported: Set<string>;
    private readonly chunks;
    private readonly reverse;
    constructor(profile: PrinterProfile);
    has(ch: string): boolean;
    prepare(text: string | null | undefined): string;
    private encode;
    columnsFor(size?: TextSize): number;
    wrap(text: string, columns: number): string[];
    private emit;
    text(text: string, opts?: {
        align?: Align;
        bold?: boolean;
        size?: TextSize;
    }): this;
    row(label: string, value: string, opts?: {
        bold?: boolean;
        size?: TextSize;
        indent?: number;
    }): this;
    qr(data: string, moduleSize?: number): this;
    rule(char?: string): this;
    blank(n?: number): this;
    finish(opts?: {
        cut?: boolean;
        drawer?: boolean;
    }): Buffer;
}
