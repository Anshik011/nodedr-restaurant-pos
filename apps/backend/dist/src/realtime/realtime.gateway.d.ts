import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { BranchAccessService } from '../common/services/branch-access.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwt;
    private readonly prisma;
    private readonly branchAccess;
    private readonly logger;
    server: Server;
    constructor(jwt: JwtService, prisma: PrismaService, branchAccess: BranchAccessService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(): void;
    emitToBranch(branchId: string, event: string, payload: unknown): void;
    emitToUsers(userIds: string[], event: string, payload: unknown): void;
    private branchRoom;
    private userRoom;
    private extractSessionCookie;
}
