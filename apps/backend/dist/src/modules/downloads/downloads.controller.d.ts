import type { Response } from 'express';
import { DownloadsService } from './downloads.service';
export declare class DownloadsController {
    private readonly downloads;
    constructor(downloads: DownloadsService);
    stats(): Promise<{
        channel: string;
        count: number;
    }[]>;
    go(channel: string, res: Response): Promise<void>;
}
