export interface VersionInfo {
    currentVersion: string;
    latestVersion: string | null;
    updateAvailable: boolean;
    building: boolean;
    releaseUrl: string | null;
    checkedAt: string;
}
export declare class UpdateService {
    private readonly logger;
    private cache;
    private cacheExpiresAt;
    checkForUpdate(): Promise<VersionInfo>;
    applyUpdate(): Promise<{
        status: string;
        message: string;
    }>;
    getProgress(): Promise<{
        state: string;
        step?: string | null;
        error?: string | null;
    }>;
    private imageTagExists;
    private fetchLatestTag;
}
