import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { AuditService } from '../../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import { type AeatSender } from './verifactu.aeat';
import { type VerifactuEnvironment } from './verifactu.domain';
type Tx = Prisma.TransactionClient;
export interface VerifactuQr {
    url: string;
    heading: string;
    legend: string;
    short: string;
    invoiceNumber: string;
}
export declare class VerifactuService {
    private readonly prisma;
    private readonly config;
    private readonly audit;
    private readonly logger;
    private sending;
    sender: AeatSender;
    constructor(prisma: PrismaService, config: ConfigService, audit: AuditService);
    producer(): {
        name: string;
        country: string;
        idType: string;
        id: string;
        systemId: string;
        version: string;
    };
    private system;
    private get key();
    private seal;
    private open;
    private branchOrThrow;
    private problems;
    getSettings(restaurantId: string, branchId: string): Promise<{
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
    saveSettings(restaurantId: string, userId: string, branchId: string, dto: {
        enabled: boolean;
        environment: VerifactuEnvironment;
        seriesPrefix: string;
    }): Promise<{
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
    uploadCertificate(restaurantId: string, userId: string, branchId: string, file: Buffer, password: string): Promise<{
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
    private lockChain;
    private append;
    private toCents;
    recordPaidOrder(tx: Tx, orderId: string): Promise<{
        id: string;
        createdAt: Date;
        restaurantId: string;
        branchId: string;
        status: import("@prisma/client").$Enums.VerifactuStatus;
        type: import("@prisma/client").$Enums.VerifactuRecordType;
        orderId: string | null;
        attempts: number;
        nextAttemptAt: Date;
        hash: string;
        invoiceNumber: string;
        csv: string | null;
        issuerNif: string;
        seq: number;
        invoiceType: string;
        issueDate: string;
        taxTotalCents: number;
        totalCents: number;
        generatedAt: string;
        previousHash: string | null;
        xml: string;
        qrUrl: string | null;
        environment: import("@prisma/client").$Enums.VerifactuEnvironment;
        refundId: string | null;
        errorCode: string | null;
        errorText: string | null;
        responseXml: string | null;
        submittedAt: Date | null;
    } | null>;
    recordRefund(tx: Tx, orderId: string, refundId: string, amount: Prisma.Decimal | number): Promise<{
        id: string;
        createdAt: Date;
        restaurantId: string;
        branchId: string;
        status: import("@prisma/client").$Enums.VerifactuStatus;
        type: import("@prisma/client").$Enums.VerifactuRecordType;
        orderId: string | null;
        attempts: number;
        nextAttemptAt: Date;
        hash: string;
        invoiceNumber: string;
        csv: string | null;
        issuerNif: string;
        seq: number;
        invoiceType: string;
        issueDate: string;
        taxTotalCents: number;
        totalCents: number;
        generatedAt: string;
        previousHash: string | null;
        xml: string;
        qrUrl: string | null;
        environment: import("@prisma/client").$Enums.VerifactuEnvironment;
        refundId: string | null;
        errorCode: string | null;
        errorText: string | null;
        responseXml: string | null;
        submittedAt: Date | null;
    } | null>;
    ordersWithRecords(orderIds: string[]): Promise<string[]>;
    qrForOrder(orderId: string): Promise<VerifactuQr | null>;
    records(restaurantId: string, branchId: string, take?: number, skip?: number): Promise<{
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
    verifyChain(restaurantId: string, branchId: string): Promise<{
        ok: false;
        checked: number;
        brokenAt: number;
        environment: "TEST" | "PRODUCTION";
        reason: string;
    } | {
        ok: true;
        checked: number;
    }>;
    private rehash;
    exportXml(restaurantId: string, branchId: string): Promise<string>;
    tick(): Promise<void>;
    submitAll(): Promise<number>;
    sendNow(restaurantId: string, branchId: string): Promise<{
        sent: number;
    }>;
    private submitChain;
}
export {};
