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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var WebhooksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = exports.WEBHOOK_EVENTS = void 0;
const node_crypto_1 = require("node:crypto");
const node_http_1 = __importDefault(require("node:http"));
const node_https_1 = __importDefault(require("node:https"));
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const totp_1 = require("../../auth/totp");
const prisma_service_1 = require("../../prisma/prisma.service");
const net_guard_1 = require("./net-guard");
const signing_1 = require("./signing");
exports.WEBHOOK_EVENTS = [
    'order.created',
    'order.paid',
    'order.cancelled',
    'reservation.created',
    'delivery.updated',
    'campaign.message',
];
const TIMEOUT_MS = 8000;
const BATCH = 20;
const CLAIM_MS = 2 * 60_000;
let WebhooksService = WebhooksService_1 = class WebhooksService {
    prisma;
    config;
    logger = new common_1.Logger(WebhooksService_1.name);
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
    }
    get keyMaterial() {
        return (this.config.get('WEBHOOK_KEY') ??
            this.config.getOrThrow('JWT_SECRET'));
    }
    async emitForBranch(branchId, event, data) {
        try {
            const branch = await this.prisma.branch.findUnique({
                where: { id: branchId },
                select: { restaurantId: true },
            });
            if (!branch)
                return;
            await this.emit(branch.restaurantId, event, {
                branchId,
                ...data,
            });
        }
        catch (err) {
            this.logger.warn(`emit ${event} failed: ${String(err)}`);
        }
    }
    async hasSubscriber(branchId, event) {
        const branch = await this.prisma.branch.findUnique({
            where: { id: branchId },
            select: { restaurantId: true },
        });
        if (!branch)
            return false;
        const n = await this.prisma.webhookEndpoint.count({
            where: {
                restaurantId: branch.restaurantId,
                isActive: true,
                events: { has: event },
            },
        });
        return n > 0;
    }
    async emit(restaurantId, event, data) {
        const endpoints = await this.prisma.webhookEndpoint.findMany({
            where: { restaurantId, isActive: true, events: { has: event } },
            select: { id: true },
        });
        if (endpoints.length === 0)
            return;
        const payload = {
            event,
            createdAt: new Date().toISOString(),
            data,
        };
        await this.prisma.webhookDelivery.createMany({
            data: endpoints.map((e) => ({ endpointId: e.id, event, payload })),
        });
    }
    list(restaurantId) {
        return this.prisma.webhookEndpoint.findMany({
            where: { restaurantId },
            select: {
                id: true,
                url: true,
                events: true,
                description: true,
                isActive: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(restaurantId, dto) {
        const events = this.validateEvents(dto.events);
        await this.assertUrl(dto.url);
        const secret = `whsec_${(0, node_crypto_1.randomBytes)(24).toString('base64url')}`;
        const row = await this.prisma.webhookEndpoint.create({
            data: {
                restaurantId,
                url: dto.url,
                events,
                description: dto.description,
                secret: (0, totp_1.sealSecret)(secret, this.keyMaterial),
            },
            select: {
                id: true,
                url: true,
                events: true,
                description: true,
                isActive: true,
            },
        });
        return { ...row, secret };
    }
    validateEvents(events) {
        const unknown = events.filter((e) => !exports.WEBHOOK_EVENTS.includes(e));
        if (events.length === 0 || unknown.length > 0)
            throw new common_1.BadRequestException(unknown.length
                ? `Unknown event: ${unknown.join(', ')}`
                : 'Choose at least one event');
        return [...new Set(events)];
    }
    async assertUrl(url) {
        try {
            await (0, net_guard_1.resolveWebhookTarget)(url, (0, net_guard_1.netOptionsFromEnv)());
        }
        catch (err) {
            throw new common_1.BadRequestException(err instanceof Error ? err.message : 'Invalid URL');
        }
    }
    async get(restaurantId, id) {
        const e = await this.prisma.webhookEndpoint.findFirst({
            where: { id, restaurantId },
        });
        if (!e)
            throw new common_1.NotFoundException('Webhook not found');
        return e;
    }
    async setActive(restaurantId, id, isActive) {
        await this.get(restaurantId, id);
        await this.prisma.webhookEndpoint.update({
            where: { id },
            data: { isActive },
        });
        return { ok: true };
    }
    async remove(restaurantId, id) {
        await this.get(restaurantId, id);
        await this.prisma.webhookEndpoint.delete({ where: { id } });
        return { ok: true };
    }
    async deliveries(restaurantId, id) {
        await this.get(restaurantId, id);
        return this.prisma.webhookDelivery.findMany({
            where: { endpointId: id },
            select: {
                id: true,
                event: true,
                status: true,
                attempts: true,
                lastStatusCode: true,
                lastError: true,
                createdAt: true,
                deliveredAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }
    async sendTest(restaurantId, id) {
        const e = await this.get(restaurantId, id);
        const row = await this.prisma.webhookDelivery.create({
            data: {
                endpointId: e.id,
                event: 'test',
                payload: {
                    event: 'test',
                    createdAt: new Date().toISOString(),
                    data: { message: 'Hello from Uptoware' },
                },
            },
        });
        await this.attempt(row.id);
        return this.prisma.webhookDelivery.findUniqueOrThrow({
            where: { id: row.id },
            select: {
                status: true,
                attempts: true,
                lastStatusCode: true,
                lastError: true,
            },
        });
    }
    async tick() {
        try {
            const due = await this.prisma.webhookDelivery.findMany({
                where: { status: 'PENDING', nextAttemptAt: { lte: new Date() } },
                select: { id: true },
                orderBy: { nextAttemptAt: 'asc' },
                take: BATCH,
            });
            await Promise.all(due.map((d) => this.attempt(d.id)));
        }
        catch (err) {
            this.logger.error(`webhook tick failed: ${String(err)}`);
        }
    }
    async cleanup() {
        const cutoff = new Date(Date.now() - 30 * 86_400_000);
        await this.prisma.webhookDelivery.deleteMany({
            where: { status: { not: 'PENDING' }, createdAt: { lt: cutoff } },
        });
    }
    async attempt(deliveryId) {
        const claimed = await this.prisma.webhookDelivery.updateMany({
            where: {
                id: deliveryId,
                status: 'PENDING',
                nextAttemptAt: { lte: new Date() },
            },
            data: {
                nextAttemptAt: new Date(Date.now() + CLAIM_MS),
                attempts: { increment: 1 },
            },
        });
        if (claimed.count === 0)
            return;
        const d = await this.prisma.webhookDelivery.findUniqueOrThrow({
            where: { id: deliveryId },
            include: { endpoint: true },
        });
        const body = JSON.stringify(d.payload);
        let statusCode = null;
        let error = null;
        try {
            if (!d.endpoint.isActive && d.event !== 'test')
                throw new Error('Endpoint is disabled');
            const secret = (0, totp_1.openSecret)(d.endpoint.secret, this.keyMaterial);
            const target = await (0, net_guard_1.resolveWebhookTarget)(d.endpoint.url, (0, net_guard_1.netOptionsFromEnv)());
            statusCode = await this.post(target, body, {
                'X-Uptoware-Event': d.event,
                'X-OrderRestro-Event': d.event,
                'X-Uptoware-Delivery': d.id,
                'X-OrderRestro-Delivery': d.id,
                'X-Uptoware-Signature': (0, signing_1.signPayload)(secret, body, Math.floor(Date.now() / 1000)),
                'X-OrderRestro-Signature': (0, signing_1.signPayload)(secret, body, Math.floor(Date.now() / 1000)),
            });
            if (statusCode < 200 || statusCode >= 300)
                error = `Receiver answered HTTP ${statusCode}`;
        }
        catch (err) {
            error = err instanceof Error ? err.message : String(err);
        }
        if (!error) {
            await this.prisma.webhookDelivery.update({
                where: { id: d.id },
                data: {
                    status: 'SUCCESS',
                    lastStatusCode: statusCode,
                    lastError: null,
                    deliveredAt: new Date(),
                },
            });
            return;
        }
        const exhausted = d.attempts >= signing_1.MAX_ATTEMPTS;
        await this.prisma.webhookDelivery.update({
            where: { id: d.id },
            data: {
                status: exhausted ? 'FAILED' : 'PENDING',
                lastStatusCode: statusCode,
                lastError: error.slice(0, 300),
                nextAttemptAt: new Date(Date.now() + (signing_1.BACKOFF_MS[d.attempts - 1] ?? signing_1.BACKOFF_MS.at(-1))),
            },
        });
    }
    post(target, body, headers) {
        const { url, address, family } = target;
        const client = url.protocol === 'https:' ? node_https_1.default : node_http_1.default;
        return new Promise((resolve, reject) => {
            const req = client.request({
                protocol: url.protocol,
                hostname: url.hostname,
                port: url.port || undefined,
                path: `${url.pathname}${url.search}`,
                method: 'POST',
                timeout: TIMEOUT_MS,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(body),
                    'User-Agent': 'Uptoware-Webhooks/1',
                    ...headers,
                },
                lookup: (_host, _opts, cb) => cb(null, address, family),
            }, (res) => {
                res.resume();
                resolve(res.statusCode ?? 0);
            });
            req.on('timeout', () => req.destroy(new Error('Timed out after 8 seconds')));
            req.on('error', reject);
            req.end(body);
        });
    }
};
exports.WebhooksService = WebhooksService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_10_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WebhooksService.prototype, "tick", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_3AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WebhooksService.prototype, "cleanup", null);
exports.WebhooksService = WebhooksService = WebhooksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map