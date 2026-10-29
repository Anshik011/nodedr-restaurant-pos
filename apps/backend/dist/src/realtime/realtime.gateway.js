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
var RealtimeGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeGateway = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const websockets_1 = require("@nestjs/websockets");
const branch_access_service_1 = require("../common/services/branch-access.service");
const prisma_service_1 = require("../prisma/prisma.service");
let RealtimeGateway = RealtimeGateway_1 = class RealtimeGateway {
    jwt;
    prisma;
    branchAccess;
    logger = new common_1.Logger(RealtimeGateway_1.name);
    server;
    constructor(jwt, prisma, branchAccess) {
        this.jwt = jwt;
        this.prisma = prisma;
        this.branchAccess = branchAccess;
    }
    async handleConnection(client) {
        try {
            const token = this.extractSessionCookie(client);
            if (!token)
                throw new Error('No session cookie');
            const payload = this.jwt.verify(token);
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });
            if (!user || !user.isActive)
                throw new Error('Session no longer valid');
            const branchId = client.handshake.query.branchId;
            if (typeof branchId !== 'string' || !branchId) {
                throw new Error('Missing branchId');
            }
            await this.branchAccess.assertAccess(user.restaurantId, branchId);
            await client.join(this.branchRoom(branchId));
            await client.join(this.userRoom(user.id));
        }
        catch (err) {
            this.logger.warn(`Rejecting realtime connection: ${err instanceof Error ? err.message : String(err)}`);
            client.disconnect(true);
        }
    }
    handleDisconnect() {
    }
    emitToBranch(branchId, event, payload) {
        this.server.to(this.branchRoom(branchId)).emit(event, payload);
    }
    emitToUsers(userIds, event, payload) {
        if (userIds.length === 0)
            return;
        this.server.to(userIds.map((id) => this.userRoom(id))).emit(event, payload);
    }
    branchRoom(branchId) {
        return `branch:${branchId}`;
    }
    userRoom(userId) {
        return `user:${userId}`;
    }
    extractSessionCookie(client) {
        const raw = client.handshake.headers.cookie;
        if (!raw)
            return null;
        for (const part of raw.split(';')) {
            const idx = part.indexOf('=');
            if (idx === -1)
                continue;
            const name = part.slice(0, idx).trim();
            if (name === 'uptoware_session' || name === 'nodedr_session') {
                return decodeURIComponent(part.slice(idx + 1).trim());
            }
        }
        return null;
    }
};
exports.RealtimeGateway = RealtimeGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", Function)
], RealtimeGateway.prototype, "server", void 0);
exports.RealtimeGateway = RealtimeGateway = RealtimeGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.CORS_ORIGIN ?? 'http://localhost:1995',
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_service_1.PrismaService,
        branch_access_service_1.BranchAccessService])
], RealtimeGateway);
//# sourceMappingURL=realtime.gateway.js.map