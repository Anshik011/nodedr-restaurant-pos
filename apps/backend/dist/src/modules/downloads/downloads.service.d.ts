import { PrismaService } from '../../prisma/prisma.service';
declare const DOWNLOAD_CHANNELS: Record<string, string>;
export type DownloadChannel = keyof typeof DOWNLOAD_CHANNELS;
export declare class DownloadsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    resolveChannel(channel: string): string;
    recordAndResolve(channel: string): Promise<string>;
    stats(): Promise<{
        channel: string;
        count: number;
    }[]>;
}
export {};
