import type { ReportFrequency, ReportSchedule } from '@prisma/client';
import { BranchTimeService } from '../../common/services/branch-time.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { ReportsService } from './reports.service';
export declare function periodFor(frequency: ReportFrequency, today: string): {
    from: string;
    to: string;
};
export declare function isDue(s: Pick<ReportSchedule, 'frequency' | 'lastSentAt'>, localDate: string, localHour: number, lastSentLocalDate: string | null): boolean;
export declare class ReportSchedulesService {
    private readonly prisma;
    private readonly reports;
    private readonly email;
    private readonly time;
    private readonly logger;
    constructor(prisma: PrismaService, reports: ReportsService, email: EmailService, time: BranchTimeService);
    list(branchId: string): import("@prisma/client").Prisma.PrismaPromise<{
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
    }[]>;
    create(branchId: string, dto: {
        reportKey: string;
        frequency: ReportFrequency;
        format: string;
        recipients: string[];
    }): Promise<{
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
    setActive(branchId: string, id: string, isActive: boolean): Promise<{
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
    remove(branchId: string, id: string): Promise<{
        ok: boolean;
    }>;
    private get;
    deliver(s: ReportSchedule, today: string): Promise<{
        sent: number;
        failed: number;
    }>;
    sendNow(branchId: string, id: string): Promise<{
        sent: number;
        failed: number;
    }>;
    private localToday;
    tick(): Promise<void>;
}
