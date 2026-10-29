import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
export interface SyncChange {
    seq?: string;
    tbl: string;
    pk: Record<string, unknown>;
    pkKey: string;
    op: 'U' | 'D';
    row: Record<string, unknown> | null;
    ts: string;
}
export interface ApplyResult {
    applied: number;
    skipped: number;
    conflicts: {
        tbl: string;
        pk: string;
        error: string;
    }[];
}
export declare class SyncService implements OnModuleInit, OnModuleDestroy {
    private readonly prisma;
    private readonly log;
    private meta;
    private timer;
    private running;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): void;
    state(): Promise<{
        enabled: boolean;
        role: string;
        deviceId: string;
        serverUrl: string | null;
        apiKey: string | null;
        seeded: boolean;
        lastPullSeq: bigint;
        lastPushSeq: bigint;
        lastSyncAt: Date | null;
        lastError: string | null;
        conflicts: unknown[];
    }>;
    publicStatus(): Promise<{
        enabled: boolean;
        role: string;
        serverUrl: string | null;
        hasKey: boolean;
        lastSyncAt: Date | null;
        lastError: string | null;
        pendingChanges: number;
        conflicts: unknown[];
    }>;
    schemaVersion(): Promise<string>;
    private tableMeta;
    private q;
    static compact(changes: SyncChange[]): SyncChange[];
    applyChanges(changes: SyncChange[], opts: {
        origin: string;
        tieWins: boolean;
    }): Promise<ApplyResult>;
    private applyOne;
    pull(since: bigint, device: string, limit?: number): Promise<{
        changes: SyncChange[];
        nextSeq: string;
        hasMore: boolean;
    }>;
    push(device: string, changes: SyncChange[]): Promise<ApplyResult>;
    private call;
    testConnection(serverUrl: string, apiKey: string): Promise<{
        ok: boolean;
        schema: string;
    }>;
    enable(serverUrl: string, apiKey: string, mode: 'adopt' | 'merge'): Promise<{
        pulled: number;
        pushed: number;
        conflicts: number;
    } | null>;
    disable(): Promise<void>;
    runOnce(): Promise<{
        pulled: number;
        pushed: number;
        conflicts: number;
    } | null>;
    private cycle;
}
