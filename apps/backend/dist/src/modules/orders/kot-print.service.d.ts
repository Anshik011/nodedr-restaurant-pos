import { PrismaService } from '../../prisma/prisma.service';
import { RealtimeGateway } from '../../realtime/realtime.gateway';
export interface KotPrintResult {
    ok: true;
    printed: {
        id: string;
        ticketNumber: string;
        reprint: number;
    }[];
    unsupportedChars: string[];
}
export declare class KotPrintService {
    private readonly prisma;
    private readonly realtime;
    constructor(prisma: PrismaService, realtime: RealtimeGateway);
    private load;
    printTicket(branchId: string, kotId: string, reprint: boolean): Promise<KotPrintResult>;
    printOrder(branchId: string, orderId: string, reprint: boolean): Promise<KotPrintResult>;
    private run;
}
