export type CsvValue = string | number | boolean | Date | null | undefined;
export declare function csvCell(value: CsvValue): string;
export declare function toCsv(columns: string[], rows: CsvValue[][]): string;
