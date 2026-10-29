import type { SessionUser } from '@nodedr-restaurant/types';
import { z } from 'zod';
import { BranchAccessService } from '../../common/services/branch-access.service';
import { EmailService } from '../email/email.service';
import { ReportSchedulesService } from './report-schedules.service';
declare const createSchema: z.ZodObject<{
    reportKey: z.ZodString;
    frequency: z.ZodEnum<{
        MONTHLY: "MONTHLY";
        DAILY: "DAILY";
        WEEKLY: "WEEKLY";
    }>;
    format: z.ZodEnum<{
        csv: "csv";
        xlsx: "xlsx";
        pdf: "pdf";
    }>;
    recipients: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
declare const activeSchema: z.ZodObject<{
    isActive: z.ZodBoolean;
}, z.core.$strip>;
export declare class ReportSchedulesController {
    private readonly schedules;
    private readonly email;
    private readonly branchAccess;
    constructor(schedules: ReportSchedulesService, email: EmailService, branchAccess: BranchAccessService);
    list(u: SessionUser, branchId: string): Promise<{
        emailConfigured: boolean;
        schedules: {
            id: string;
            createdAt: Date;
            isActive: boolean;
            branchId: string;
            format: string;
            lastError: string | null;
            lastSentAt: Date | null;
            recipients: string[];
            reportKey: string;
            frequency: import("@prisma/client").$Enums.ReportFrequency;
        }[];
    }>;
    create(u: SessionUser, branchId: string, body: z.infer<typeof createSchema>): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        branchId: string;
        format: string;
        lastError: string | null;
        lastSentAt: Date | null;
        recipients: string[];
        reportKey: string;
        frequency: import("@prisma/client").$Enums.ReportFrequency;
    }>;
    toggle(u: SessionUser, branchId: string, id: string, body: z.infer<typeof activeSchema>): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        branchId: string;
        format: string;
        lastError: string | null;
        lastSentAt: Date | null;
        recipients: string[];
        reportKey: string;
        frequency: import("@prisma/client").$Enums.ReportFrequency;
    }>;
    sendNow(u: SessionUser, branchId: string, id: string): Promise<{
        sent: number;
        failed: number;
    }>;
    remove(u: SessionUser, branchId: string, id: string): Promise<{
        ok: boolean;
    }>;
}
export {};
