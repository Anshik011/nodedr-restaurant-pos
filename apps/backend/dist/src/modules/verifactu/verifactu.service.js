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
var VerifactuService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifactuService = void 0;
const node_crypto_1 = require("node:crypto");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const audit_service_1 = require("../../audit/audit.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const verifactu_aeat_1 = require("./verifactu.aeat");
const verifactu_domain_1 = require("./verifactu.domain");
const BATCH = 100;
const RETRY_MS = 5 * 60_000;
let VerifactuService = VerifactuService_1 = class VerifactuService {
    prisma;
    config;
    audit;
    logger = new common_1.Logger(VerifactuService_1.name);
    sending = false;
    sender = verifactu_aeat_1.sendToAeat;
    constructor(prisma, config, audit) {
        this.prisma = prisma;
        this.config = config;
        this.audit = audit;
    }
    producer() {
        const get = (k, d) => (this.config.get(k) ?? '').trim() || d;
        return {
            name: get('VERIFACTU_PRODUCER_NAME', 'NODEDR INFOTECH PRIVATE LIMITED'),
            country: get('VERIFACTU_PRODUCER_COUNTRY', 'IN'),
            idType: get('VERIFACTU_PRODUCER_ID_TYPE', '04'),
            id: get('VERIFACTU_PRODUCER_ID', ''),
            systemId: get('VERIFACTU_SYSTEM_ID', 'OR'),
            version: get('APP_VERSION', '1.0.0'),
        };
    }
    system(installationNumber) {
        const p = this.producer();
        return {
            producerName: p.name,
            producerCountry: p.country,
            producerIdType: p.idType,
            producerId: p.id,
            systemName: 'OrderRestro',
            systemId: p.systemId,
            version: p.version,
            installationNumber,
        };
    }
    get key() {
        const material = this.config.get('VERIFACTU_KEY') ??
            this.config.getOrThrow('JWT_SECRET');
        return (0, node_crypto_1.createHash)('sha256').update(`verifactu:${material}`).digest();
    }
    seal(plain, aad) {
        const iv = (0, node_crypto_1.randomBytes)(12);
        const c = (0, node_crypto_1.createCipheriv)('aes-256-gcm', this.key, iv);
        c.setAAD(Buffer.from(aad));
        const body = Buffer.concat([c.update(plain), c.final()]);
        return Buffer.concat([iv, c.getAuthTag(), body]);
    }
    open(blob, aad) {
        const d = (0, node_crypto_1.createDecipheriv)('aes-256-gcm', this.key, blob.subarray(0, 12));
        d.setAAD(Buffer.from(aad));
        d.setAuthTag(blob.subarray(12, 28));
        return Buffer.concat([d.update(blob.subarray(28)), d.final()]);
    }
    async branchOrThrow(restaurantId, branchId) {
        const branch = await this.prisma.branch.findFirst({
            where: { id: branchId, restaurantId },
            include: { restaurant: true },
        });
        if (!branch)
            throw new common_1.NotFoundException('Branch not found');
        return branch;
    }
    problems(branch) {
        const out = [];
        if (branch.country !== 'ES')
            out.push('Set the branch country to Spain (ES).');
        if (branch.taxRegime !== 'ES_IVA')
            out.push('Set the branch tax regime to Spain - IVA.');
        if ((branch.taxId ?? '').trim().length !== 9)
            out.push('Enter the branch NIF/CIF (9 characters) in branch tax settings.');
        if (branch.restaurant.currency !== 'EUR')
            out.push('Set the restaurant currency to EUR.');
        if (!(branch.restaurant.legalName ?? branch.restaurant.name).trim())
            out.push('Set the restaurant legal name.');
        const p = this.producer();
        if (!p.id || p.id.length > 20 || p.systemId.length !== 2) {
            out.push('The server operator must set VERIFACTU_PRODUCER_ID (the producer identifier, at most 20 characters) and a 2-character VERIFACTU_SYSTEM_ID.');
        }
        return out;
    }
    async getSettings(restaurantId, branchId) {
        const branch = await this.branchOrThrow(restaurantId, branchId);
        const s = await this.prisma.verifactuSettings.findUnique({
            where: { branchId },
        });
        const grouped = await this.prisma.verifactuRecord.groupBy({
            by: ['status'],
            where: { branchId },
            _count: { _all: true },
        });
        const counts = Object.fromEntries(grouped.map((g) => [g.status, g._count._all]));
        return {
            enabled: s?.enabled ?? false,
            environment: s?.environment ?? 'TEST',
            seriesPrefix: s?.seriesPrefix ?? 'T1',
            nextNumber: s?.nextNumber ?? 1,
            hasCertificate: !!s?.certEncrypted,
            certSubject: s?.certSubject ?? null,
            certExpiresAt: s?.certExpiresAt ?? null,
            problems: this.problems(branch),
            counts,
            status: 'implemented-not-certified',
        };
    }
    async saveSettings(restaurantId, userId, branchId, dto) {
        const branch = await this.branchOrThrow(restaurantId, branchId);
        const prefix = dto.seriesPrefix.trim();
        if (!/^[A-Za-z0-9-]{1,12}$/.test(prefix)) {
            throw new common_1.BadRequestException('The invoice series may use letters, digits and "-" (at most 12 characters).');
        }
        if (dto.enabled) {
            const problems = this.problems(branch);
            if (problems.length)
                throw new common_1.BadRequestException(problems.join(' '));
        }
        const existing = await this.prisma.verifactuSettings.findUnique({
            where: { branchId },
        });
        if (existing && existing.seriesPrefix !== prefix) {
            const used = await this.prisma.verifactuRecord.count({
                where: { branchId },
            });
            if (used > 0)
                throw new common_1.ConflictException('The series cannot change once records exist; it would restart the numbering.');
        }
        const clash = await this.prisma.verifactuSettings.findFirst({
            where: {
                seriesPrefix: prefix,
                branchId: { not: branchId },
                branch: { restaurantId, taxId: branch.taxId },
            },
        });
        if (clash)
            throw new common_1.ConflictException(`Another branch with the same tax ID already uses the series "${prefix}".`);
        const data = {
            enabled: dto.enabled,
            environment: dto.environment,
            seriesPrefix: prefix,
        };
        const saved = existing
            ? await this.prisma.verifactuSettings.update({
                where: { branchId },
                data,
            })
            : await this.prisma.verifactuSettings.create({
                data: { branchId, installationNumber: (0, node_crypto_1.randomUUID)(), ...data },
            });
        await this.audit.record({
            userId,
            action: 'verifactu.settings_changed',
            entity: 'Branch',
            entityId: branchId,
            metadata: {
                enabled: saved.enabled,
                environment: saved.environment,
                seriesPrefix: saved.seriesPrefix,
            },
        });
        return this.getSettings(restaurantId, branchId);
    }
    async uploadCertificate(restaurantId, userId, branchId, file, password) {
        await this.branchOrThrow(restaurantId, branchId);
        if (!password)
            throw new common_1.BadRequestException('Enter the certificate password.');
        let info;
        try {
            info = (0, verifactu_aeat_1.inspectCertificate)(file, password);
        }
        catch (e) {
            throw new common_1.BadRequestException(e.message);
        }
        if (info.expiresAt.getTime() < Date.now())
            throw new common_1.BadRequestException('This certificate has expired.');
        const existing = await this.prisma.verifactuSettings.findUnique({
            where: { branchId },
        });
        const data = {
            certEncrypted: new Uint8Array(this.seal(file, branchId)),
            certPasswordEncrypted: new Uint8Array(this.seal(Buffer.from(password, 'utf8'), branchId)),
            certSubject: info.subject.slice(0, 300),
            certExpiresAt: info.expiresAt,
        };
        if (existing)
            await this.prisma.verifactuSettings.update({ where: { branchId }, data });
        else
            await this.prisma.verifactuSettings.create({
                data: { branchId, installationNumber: (0, node_crypto_1.randomUUID)(), ...data },
            });
        await this.audit.record({
            userId,
            action: 'verifactu.certificate_uploaded',
            entity: 'Branch',
            entityId: branchId,
            metadata: {
                subject: info.subject.slice(0, 300),
                expiresAt: info.expiresAt.toISOString(),
            },
        });
        return this.getSettings(restaurantId, branchId);
    }
    async lockChain(tx, restaurantId, nif, env) {
        await tx.$executeRaw `SELECT pg_advisory_xact_lock(hashtext(${`verifactu|${restaurantId}|${nif}|${env}`}))`;
    }
    async append(tx, args) {
        const { day, timestamp } = (0, verifactu_domain_1.madridParts)(args.now);
        await this.lockChain(tx, args.restaurantId, args.issuerNif, args.environment);
        const last = await tx.verifactuRecord.findFirst({
            where: {
                restaurantId: args.restaurantId,
                issuerNif: args.issuerNif,
                environment: args.environment,
            },
            orderBy: { seq: 'desc' },
        });
        const previous = last
            ? {
                issuerNif: last.issuerNif,
                number: last.invoiceNumber,
                issueDate: last.issueDate,
                hash: last.hash,
            }
            : null;
        const b = (0, verifactu_domain_1.buildBreakdown)(args.lines, args.targetCents);
        const id = {
            issuerNif: args.issuerNif,
            number: args.number,
            issueDate: day,
        };
        const rec = {
            id,
            issuerName: args.issuerName,
            invoiceType: args.invoiceType,
            description: args.description,
            breakdown: b.breakdown,
            taxTotalCents: b.taxTotalCents,
            totalCents: b.totalCents,
            previous,
            system: this.system(args.installationNumber),
            generatedAt: timestamp,
            rectified: args.rectified,
        };
        try {
            (0, verifactu_domain_1.validateAlta)(rec);
        }
        catch (e) {
            throw new common_1.BadRequestException(e.message);
        }
        const hash = (0, verifactu_domain_1.altaHash)(rec);
        return tx.verifactuRecord.create({
            data: {
                restaurantId: args.restaurantId,
                branchId: args.branchId,
                issuerNif: args.issuerNif,
                seq: (last?.seq ?? 0) + 1,
                type: 'ALTA',
                invoiceType: args.invoiceType,
                invoiceNumber: args.number,
                issueDate: day,
                taxTotalCents: b.taxTotalCents,
                totalCents: b.totalCents,
                generatedAt: timestamp,
                previousHash: previous?.hash ?? null,
                hash,
                xml: (0, verifactu_domain_1.altaXml)(rec),
                qrUrl: (0, verifactu_domain_1.qrUrl)(args.environment, id, b.totalCents),
                environment: args.environment,
                orderId: args.orderId,
                refundId: args.refundId ?? null,
            },
        });
    }
    toCents(v) {
        return Math.round(Number(v) * 100);
    }
    async recordPaidOrder(tx, orderId) {
        const order = await tx.order.findUniqueOrThrow({
            where: { id: orderId },
            include: {
                items: true,
                branch: { include: { restaurant: true, verifactuSettings: true } },
            },
        });
        const s = order.branch.verifactuSettings;
        if (!s?.enabled || order.branch.country !== 'ES')
            return null;
        const problems = this.problems(order.branch);
        if (problems.length)
            throw new common_1.BadRequestException(`VERI*FACTU is on but not ready: ${problems.join(' ')}`);
        const dup = await tx.verifactuRecord.findFirst({
            where: { orderId, type: 'ALTA', invoiceType: 'F2' },
        });
        if (dup)
            return dup;
        const bumped = await tx.verifactuSettings.update({
            where: { branchId: s.branchId },
            data: { nextNumber: { increment: 1 } },
        });
        const number = `${s.seriesPrefix}-${String(bumped.nextNumber - 1).padStart(6, '0')}`;
        const target = this.toCents(order.totalAmount) - this.toCents(order.tipAmount);
        return this.append(tx, {
            restaurantId: order.branch.restaurantId,
            branchId: order.branchId,
            issuerNif: (order.branch.taxId ?? '').trim().toUpperCase(),
            issuerName: (order.branch.restaurant.legalName ?? order.branch.restaurant.name).trim(),
            environment: s.environment,
            installationNumber: s.installationNumber,
            invoiceType: 'F2',
            number,
            description: 'Servicios de restauración',
            lines: order.items.map((i) => ({
                grossCents: this.toCents(i.lineTotal),
                ratePercent: Number(i.taxRateSnapshot),
            })),
            targetCents: target,
            orderId,
            now: new Date(),
        });
    }
    async recordRefund(tx, orderId, refundId, amount) {
        const order = await tx.order.findUniqueOrThrow({
            where: { id: orderId },
            include: {
                items: true,
                branch: { include: { restaurant: true, verifactuSettings: true } },
            },
        });
        const s = order.branch.verifactuSettings;
        if (!s?.enabled || order.branch.country !== 'ES')
            return null;
        const original = await tx.verifactuRecord.findFirst({
            where: {
                orderId,
                type: 'ALTA',
                invoiceType: 'F2',
                environment: s.environment,
            },
        });
        if (!original) {
            this.logger.warn(`Refund ${refundId}: order ${order.orderNumber} was sold before VERI*FACTU was on, so there is no invoice to rectify`);
            return null;
        }
        const bumped = await tx.verifactuSettings.update({
            where: { branchId: s.branchId },
            data: { nextRefundNumber: { increment: 1 } },
        });
        const number = `R${s.seriesPrefix}-${String(bumped.nextRefundNumber - 1).padStart(6, '0')}`;
        return this.append(tx, {
            restaurantId: order.branch.restaurantId,
            branchId: order.branchId,
            issuerNif: original.issuerNif,
            issuerName: (order.branch.restaurant.legalName ?? order.branch.restaurant.name).trim(),
            environment: s.environment,
            installationNumber: s.installationNumber,
            invoiceType: 'R5',
            number,
            description: 'Devolución de servicios de restauración',
            lines: order.items.map((i) => ({
                grossCents: this.toCents(i.lineTotal),
                ratePercent: Number(i.taxRateSnapshot),
            })),
            targetCents: -this.toCents(amount),
            orderId,
            refundId,
            rectified: [
                {
                    issuerNif: original.issuerNif,
                    number: original.invoiceNumber,
                    issueDate: original.issueDate,
                },
            ],
            now: new Date(),
        });
    }
    async ordersWithRecords(orderIds) {
        const rows = await this.prisma.verifactuRecord.findMany({
            where: { orderId: { in: orderIds } },
            select: { orderId: true },
            distinct: ['orderId'],
        });
        return rows.map((r) => r.orderId).filter(Boolean);
    }
    async qrForOrder(orderId) {
        const rec = await this.prisma.verifactuRecord.findFirst({
            where: { orderId, type: 'ALTA', invoiceType: 'F2', qrUrl: { not: null } },
            orderBy: { seq: 'asc' },
        });
        if (!rec?.qrUrl)
            return null;
        return {
            url: rec.qrUrl,
            heading: verifactu_domain_1.QR_HEADING,
            legend: verifactu_domain_1.QR_VERIFIABLE,
            short: verifactu_domain_1.QR_SHORT,
            invoiceNumber: rec.invoiceNumber,
        };
    }
    async records(restaurantId, branchId, take = 50, skip = 0) {
        await this.branchOrThrow(restaurantId, branchId);
        const [items, total] = await Promise.all([
            this.prisma.verifactuRecord.findMany({
                where: { branchId },
                orderBy: { seq: 'desc' },
                take: Math.min(Math.max(take, 1), 200),
                skip,
                select: {
                    id: true,
                    seq: true,
                    type: true,
                    invoiceType: true,
                    invoiceNumber: true,
                    issueDate: true,
                    totalCents: true,
                    taxTotalCents: true,
                    hash: true,
                    status: true,
                    attempts: true,
                    csv: true,
                    errorCode: true,
                    errorText: true,
                    submittedAt: true,
                    environment: true,
                    orderId: true,
                },
            }),
            this.prisma.verifactuRecord.count({ where: { branchId } }),
        ]);
        return { items, total };
    }
    async verifyChain(restaurantId, branchId) {
        const branch = await this.branchOrThrow(restaurantId, branchId);
        const nif = (branch.taxId ?? '').trim().toUpperCase();
        let checked = 0;
        for (const environment of ['TEST', 'PRODUCTION']) {
            const recs = await this.prisma.verifactuRecord.findMany({
                where: { restaurantId, issuerNif: nif, environment },
                orderBy: { seq: 'asc' },
            });
            let prevHash = null;
            let expectSeq = 1;
            for (const r of recs) {
                checked += 1;
                const fail = (reason) => ({
                    ok: false,
                    checked,
                    brokenAt: r.seq,
                    environment,
                    reason,
                });
                if (r.seq !== expectSeq)
                    return fail('a record is missing from the sequence');
                if (r.previousHash !== prevHash)
                    return fail('the record does not continue the previous one');
                const m = /<sf:Huella>([0-9A-F]{64})<\/sf:Huella><\/sf:RegistroAlta>$/.exec(r.xml);
                if (!m || m[1] !== r.hash)
                    return fail('the stored XML does not match the stored fingerprint');
                const again = this.rehash(r);
                if (again !== r.hash)
                    return fail('the fingerprint does not match the record fields');
                prevHash = r.hash;
                expectSeq += 1;
            }
        }
        return { ok: true, checked };
    }
    rehash(r) {
        return (0, verifactu_domain_1.altaHash)({
            id: {
                issuerNif: r.issuerNif,
                number: r.invoiceNumber,
                issueDate: r.issueDate,
            },
            issuerName: '',
            invoiceType: r.invoiceType,
            description: '',
            breakdown: [],
            taxTotalCents: r.taxTotalCents,
            totalCents: r.totalCents,
            previous: r.previousHash
                ? {
                    issuerNif: r.issuerNif,
                    number: '',
                    issueDate: '',
                    hash: r.previousHash,
                }
                : null,
            system: this.system(''),
            generatedAt: r.generatedAt,
        });
    }
    async exportXml(restaurantId, branchId) {
        const branch = await this.branchOrThrow(restaurantId, branchId);
        const recs = await this.prisma.verifactuRecord.findMany({
            where: { branchId },
            orderBy: [{ environment: 'asc' }, { seq: 'asc' }],
        });
        return (0, verifactu_domain_1.envelope)((branch.restaurant.legalName ?? branch.restaurant.name).trim(), (branch.taxId ?? '').trim().toUpperCase(), recs.map((r) => r.xml));
    }
    async tick() {
        try {
            await this.submitAll();
        }
        catch (e) {
            this.logger.error(`VERI*FACTU submission run failed: ${e.message}`);
        }
    }
    async submitAll() {
        if (this.sending)
            return 0;
        this.sending = true;
        try {
            const chains = await this.prisma.verifactuRecord.findMany({
                where: {
                    status: { in: ['PENDING', 'ERROR'] },
                    nextAttemptAt: { lte: new Date() },
                },
                distinct: ['restaurantId', 'issuerNif', 'environment'],
                select: {
                    restaurantId: true,
                    issuerNif: true,
                    environment: true,
                    branchId: true,
                },
            });
            let sent = 0;
            for (const c of chains)
                sent += await this.submitChain(c.restaurantId, c.issuerNif, c.environment);
            return sent;
        }
        finally {
            this.sending = false;
        }
    }
    async sendNow(restaurantId, branchId) {
        const branch = await this.branchOrThrow(restaurantId, branchId);
        const nif = (branch.taxId ?? '').trim().toUpperCase();
        await this.prisma.verifactuRecord.updateMany({
            where: {
                restaurantId,
                issuerNif: nif,
                status: { in: ['PENDING', 'ERROR'] },
            },
            data: { nextAttemptAt: new Date() },
        });
        let sent = 0;
        for (const environment of ['TEST', 'PRODUCTION'])
            sent += await this.submitChain(restaurantId, nif, environment);
        return { sent };
    }
    async submitChain(restaurantId, issuerNif, environment) {
        const pendingWhere = {
            restaurantId,
            issuerNif,
            environment,
            status: { in: ['PENDING', 'ERROR'] },
        };
        const waiting = await this.prisma.verifactuRecord.findFirst({
            where: { ...pendingWhere, nextAttemptAt: { gt: new Date() } },
        });
        if (waiting)
            return 0;
        const recs = await this.prisma.verifactuRecord.findMany({
            where: pendingWhere,
            orderBy: { seq: 'asc' },
            take: BATCH,
        });
        if (recs.length === 0)
            return 0;
        const branch = await this.prisma.branch.findUnique({
            where: { id: recs[0].branchId },
            include: { restaurant: true, verifactuSettings: true },
        });
        const s = branch?.verifactuSettings;
        if (!branch || !s?.enabled || !s.certEncrypted || !s.certPasswordEncrypted)
            return 0;
        let pfx;
        let pass;
        try {
            pfx = this.open(Buffer.from(s.certEncrypted), s.branchId);
            pass = this.open(Buffer.from(s.certPasswordEncrypted), s.branchId).toString('utf8');
        }
        catch {
            this.logger.error('VERI*FACTU certificate cannot be decrypted (was the app secret changed?). Upload it again.');
            return 0;
        }
        const body = (0, verifactu_domain_1.envelope)((branch.restaurant.legalName ?? branch.restaurant.name).trim(), issuerNif, recs.map((r) => r.xml));
        const releaseAfter = async (ms) => this.prisma.verifactuRecord.updateMany({
            where: pendingWhere,
            data: { nextAttemptAt: new Date(Date.now() + ms) },
        });
        let resp;
        try {
            resp = await this.sender(environment, pfx, pass, body);
        }
        catch (e) {
            const text = e.message.slice(0, 1000);
            await this.prisma.verifactuRecord.updateMany({
                where: { id: { in: recs.map((r) => r.id) } },
                data: { status: 'ERROR', errorText: text, attempts: { increment: 1 } },
            });
            await releaseAfter(RETRY_MS);
            this.logger.warn(`VERI*FACTU submission failed: ${text}`);
            return 0;
        }
        const byKey = new Map(resp.lines.map((l) => [`${l.number}|${l.issueDate}|${l.operation}`, l]));
        for (const r of recs) {
            const l = byKey.get(`${r.invoiceNumber}|${r.issueDate}|${r.type === 'ALTA' ? 'Alta' : 'Anulacion'}`);
            let status;
            let errorCode = null;
            let errorText = null;
            if (!l && resp.state === 'Correcto')
                status = 'ACCEPTED';
            else if (!l) {
                status = 'ERROR';
                errorText = 'AEAT returned no result for this record';
            }
            else if (l.state === 'Correcto')
                status = 'ACCEPTED';
            else if (l.state === 'AceptadoConErrores') {
                status = 'ACCEPTED_WITH_ERRORS';
                errorCode = l.errorCode;
                errorText = l.errorText;
            }
            else {
                status = 'REJECTED';
                errorCode = l.errorCode;
                errorText = l.errorText;
            }
            await this.prisma.verifactuRecord.update({
                where: { id: r.id },
                data: {
                    status,
                    errorCode,
                    errorText,
                    csv: resp.csv || null,
                    responseXml: resp.raw,
                    submittedAt: new Date(),
                    attempts: { increment: 1 },
                },
            });
        }
        await releaseAfter(Math.max(resp.waitSeconds, 60) * 1000);
        return recs.length;
    }
};
exports.VerifactuService = VerifactuService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VerifactuService.prototype, "tick", null);
exports.VerifactuService = VerifactuService = VerifactuService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        audit_service_1.AuditService])
], VerifactuService);
//# sourceMappingURL=verifactu.service.js.map