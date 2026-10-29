export type CodepageName = 'CP437' | 'CP850' | 'CP858' | 'CP1252';
export declare const CODEPAGES: Record<CodepageName, {
    escposTable: number;
    high: string;
}>;
