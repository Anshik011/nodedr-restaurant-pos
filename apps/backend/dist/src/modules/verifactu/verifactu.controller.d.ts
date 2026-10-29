import type { SessionUser } from '@nodedr-restaurant/types';
import { BranchAccessService } from '../../common/services/branch-access.service';
import { VerifactuService } from './verifactu.service';
export declare class VerifactuController {
    private readonly service;
    private readonly branchAccess;
    constructor(service: VerifactuService, branchAccess: BranchAccessService);
    settings(user: SessionUser, branchId: string): Promise<{
        enabled: boolean;
        environment: import("@prisma/client").$Enums.VerifactuEnvironment;
        seriesPrefix: string;
        nextNumber: number;
        hasCertificate: boolean;
        certSubject: string | null;
        certExpiresAt: Date | null;
        problems: string[];
        counts: {
            [k: string]: number;
        };
        status: string;
    }>;
    save(user: SessionUser, branchId: string, body: unknown): Promise<{
        enabled: boolean;
        environment: import("@prisma/client").$Enums.VerifactuEnvironment;
        seriesPrefix: string;
        nextNumber: number;
        hasCertificate: boolean;
        certSubject: string | null;
        certExpiresAt: Date | null;
        problems: string[];
        counts: {
            [k: string]: number;
        };
        status: string;
    }>;
    certificate(user: SessionUser, branchId: string, file: {
        buffer: Buffer;
    } | undefined, password: string): Promise<{
        enabled: boolean;
        environment: import("@prisma/client").$Enums.VerifactuEnvironment;
        seriesPrefix: string;
        nextNumber: number;
        hasCertificate: boolean;
        certSubject: string | null;
        certExpiresAt: Date | null;
        problems: string[];
        counts: {
            [k: string]: number;
        };
        status: string;
    }>;
    records(user: SessionUser, branchId: string, take?: string, skip?: string): Promise<{
        items: {
            id: string;
            status: import("@prisma/client").$Enums.VerifactuStatus;
            type: import("@prisma/client").$Enums.VerifactuRecordType;
            orderId: string | null;
            attempts: number;
            hash: string;
            invoiceNumber: string;
            csv: string | null;
            seq: number;
            invoiceType: string;
            issueDate: string;
            taxTotalCents: number;
            totalCents: number;
            environment: import("@prisma/client").$Enums.VerifactuEnvironment;
            errorCode: string | null;
            errorText: string | null;
            submittedAt: Date | null;
        }[];
        total: number;
    }>;
    verify(user: SessionUser, branchId: string): Promise<{
        ok: false;
        checked: number;
        brokenAt: number;
        environment: "TEST" | "PRODUCTION";
        reason: string;
    } | {
        ok: true;
        checked: number;
    }>;
    send(user: SessionUser, branchId: string): Promise<{
        sent: number;
    }>;
    export(user: SessionUser, branchId: string): Promise<string>;
}
