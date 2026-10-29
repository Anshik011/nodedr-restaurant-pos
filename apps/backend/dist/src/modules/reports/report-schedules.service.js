"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ReportSchedulesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportSchedulesService = void 0;
exports.periodFor = periodFor;
exports.isDue = isDue;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const branch_time_service_1 = require("../../common/services/branch-time.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const export_1 = require("./export");
const reports_service_1 = require("./reports.service");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (iso_, n) => {
    const d = new Date(`${iso_}T00:00:00.000Z`);
    d.setUTCDate(d.getUTCDate() + n);
    return iso(d);
};
function periodFor(frequency, today) {
    if (frequency === 'DAILY') {
        const y = addDays(today, -1);
        return { from: y, to: y };
    }
    if (frequency === 'WEEKLY') {
        return { from: addDays(today, -7), to: addDays(today, -1) };
    }
    const [y, m] = today.split('-').map(Number);
    const first = new Date(Date.UTC(y, m - 2, 1));
    const last = new Date(Date.UTC(y, m - 1, 0));
    return { from: iso(first), to: iso(last) };
}
function isDue(s, localDate, localHour, lastSentLocalDate) {
    if (localHour < 6)
        return false;
    if (lastSentLocalDate === localDate)
        return false;
    const dow = new Date(`${localDate}T00:00:00.000Z`).getUTCDay();
    const dom = Number(localDate.slice(8, 10));
    if (s.frequency === 'WEEKLY')
        return dow === 1;
    if (s.frequency === 'MONTHLY')
        return dom === 1;
    return true;
}
let ReportSchedulesService = ReportSchedulesService_1 = class ReportSchedulesService {
    prisma;
    reports;
    email;
    time;
    logger = new common_1.Logger(ReportSchedulesService_1.name);
    constructor(prisma, reports, email, time) {
        this.prisma = prisma;
        this.reports = reports;
        this.email = email;
        this.time = time;
    }
    list(branchId) {
        return this.prisma.reportSchedule.findMany({
            where: { branchId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(branchId, dto) {
        if (!reports_service_1.REPORT_CATALOG.some((r) => r.key === dto.reportKey))
            throw new common_1.BadRequestException('Unknown report');
        if (!(0, export_1.isExportFormat)(dto.format))
            throw new common_1.BadRequestException('Format must be csv, xlsx or pdf');
        const recipients = [
            ...new Set(dto.recipients.map((r) => r.trim().toLowerCase())),
        ];
        if (!recipients.length || recipients.some((r) => !EMAIL.test(r)))
            throw new common_1.BadRequestException('Enter valid recipient email addresses');
        return this.prisma.reportSchedule.create({
            data: { branchId, ...dto, recipients },
        });
    }
    async setActive(branchId, id, isActive) {
        await this.get(branchId, id);
        return this.prisma.reportSchedule.update({
            where: { id },
            data: { isActive },
        });
    }
    async remove(branchId, id) {
        await this.get(branchId, id);
        await this.prisma.reportSchedule.delete({ where: { id } });
        return { ok: true };
    }
    async get(branchId, id) {
        const s = await this.prisma.reportSchedule.findFirst({
            where: { id, branchId },
        });
        if (!s)
            throw new common_1.NotFoundException('Schedule not found');
        return s;
    }
    async deliver(s, today) {
        if (!this.email.isConfigured())
            throw new common_1.BadRequestException('Email is not set up: set SMTP_URL and SMTP_FROM on the server');
        const { from, to } = periodFor(s.frequency, today);
        const result = await this.reports.run(s.reportKey, s.branchId, from, to);
        const format = (0, export_1.isExportFormat)(s.format) ? s.format : 'xlsx';
        const body = await (0, export_1.renderReport)(result, format, `${from} to ${to}`);
        const t = export_1.EXPORT_TYPES[format];
        const subject = `${result.title} · ${from === to ? from : `${from} to ${to}`}`;
        const out = await this.email.sendEach(s.recipients.map((to_) => ({
            to: to_,
            subject,
            text: `Your scheduled ${result.title} report for ${from} to ${to} is attached.\n\nSent by Uptoware Restaurant ERP.`,
            attachments: [
                {
                    filename: `${s.reportKey}_${from}_${to}.${t.ext}`,
                    content: body,
                    contentType: t.mime.split(';')[0],
                },
            ],
        })));
        if (!out.sent)
            throw new common_1.BadRequestException('No email could be delivered');
        await this.prisma.reportSchedule.update({
            where: { id: s.id },
            data: {
                lastSentAt: new Date(),
                lastError: out.failed ? `${out.failed} recipient(s) failed` : null,
            },
        });
        return out;
    }
    async sendNow(branchId, id) {
        const s = await this.get(branchId, id);
        const tz = await this.time.tzForBranch(branchId);
        return this.deliver(s, this.localToday(tz).date);
    }
    localToday(tz) {
        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: tz,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            hourCycle: 'h23',
        }).formatToParts(new Date());
        const g = (t) => parts.find((p) => p.type === t)?.value ?? '00';
        return {
            date: `${g('year')}-${g('month')}-${g('day')}`,
            hour: Number(g('hour')),
        };
    }
    async tick() {
        try {
            if (!this.email.isConfigured())
                return;
            const schedules = await this.prisma.reportSchedule.findMany({
                where: { isActive: true },
            });
            for (const s of schedules) {
                const tz = await this.time.tzForBranch(s.branchId);
                const now = this.localToday(tz);
                const lastLocal = s.lastSentAt
                    ? new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(s.lastSentAt)
                    : null;
                if (!isDue(s, now.date, now.hour, lastLocal))
                    continue;
                try {
                    await this.deliver(s, now.date);
                    this.logger.log(`Sent scheduled report ${s.reportKey} (${s.id})`);
                }
                catch (err) {
                    const msg = err instanceof Error ? err.message : String(err);
                    this.logger.warn(`Scheduled report ${s.id} failed: ${msg}`);
                    await this.prisma.reportSchedule.update({
                        where: { id: s.id },
                        data: { lastError: msg.slice(0, 300) },
                    });
                }
            }
        }
        catch (err) {
            this.logger.error(`Report schedule tick failed: ${err instanceof Error ? err.message : String(err)}`);
        }
    }
};
exports.ReportSchedulesService = ReportSchedulesService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_10_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportSchedulesService.prototype, "tick", null);
exports.ReportSchedulesService = ReportSchedulesService = ReportSchedulesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        reports_service_1.ReportsService,
        email_service_1.EmailService,
        branch_time_service_1.BranchTimeService])
], ReportSchedulesService);
//# sourceMappingURL=report-schedules.service.js.map