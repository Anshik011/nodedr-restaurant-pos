import { SyncChange, SyncService } from './sync.service';
export declare class SyncPeerController {
    private readonly sync;
    constructor(sync: SyncService);
    ping(): Promise<{
        ok: boolean;
        role: string;
        schema: string;
    }>;
    pull(since?: string, device?: string): Promise<{
        changes: SyncChange[];
        nextSeq: string;
        hasMore: boolean;
    }>;
    push(body: {
        device?: string;
        changes?: SyncChange[];
    }): Promise<import("./sync.service").ApplyResult>;
}
export declare class SyncController {
    private readonly sync;
    constructor(sync: SyncService);
    status(): Promise<{
        enabled: boolean;
        role: string;
        serverUrl: string | null;
        hasKey: boolean;
        lastSyncAt: Date | null;
        lastError: string | null;
        pendingChanges: number;
        conflicts: unknown[];
    }>;
    test(body: {
        serverUrl?: string;
        apiKey?: string;
    }): Promise<{
        ok: boolean;
        schema: string;
    }>;
    enable(body: {
        serverUrl?: string;
        apiKey?: string;
        mode?: string;
    }): Promise<{
        enabled: boolean;
        role: string;
        serverUrl: string | null;
        hasKey: boolean;
        lastSyncAt: Date | null;
        lastError: string | null;
        pendingChanges: number;
        conflicts: unknown[];
    }>;
    run(): Promise<{
        enabled: boolean;
        role: string;
        serverUrl: string | null;
        hasKey: boolean;
        lastSyncAt: Date | null;
        lastError: string | null;
        pendingChanges: number;
        conflicts: unknown[];
        pulled?: number | undefined;
        pushed?: number | undefined;
    }>;
    disable(): Promise<{
        enabled: boolean;
        role: string;
        serverUrl: string | null;
        hasKey: boolean;
        lastSyncAt: Date | null;
        lastError: string | null;
        pendingChanges: number;
        conflicts: unknown[];
    }>;
    private url;
    private key;
}
