import type { ReportResult } from './reports.service';
export type ExportFormat = 'csv' | 'xlsx' | 'pdf';
export declare const EXPORT_TYPES: Record<ExportFormat, {
    mime: string;
    ext: string;
}>;
export declare function isExportFormat(v: string): v is ExportFormat;
export declare function buildXlsx(r: ReportResult, subtitle: string): Promise<Buffer>;
export declare function buildPdf(r: ReportResult, subtitle: string): Promise<Buffer>;
export declare function renderReport(r: ReportResult, format: ExportFormat, subtitle: string): Promise<Buffer>;
