import type { BulkTableCreateDto, FloorDto, FloorUpdateDto, TableDto, TableLayoutUpdateDto, TableStatusDto, TableUpdateDto } from '@nodedr-restaurant/types';
import { PrismaService } from '../../prisma/prisma.service';
import { RealtimeGateway } from '../../realtime/realtime.gateway';
export declare class TablesService {
    private readonly prisma;
    private readonly realtime;
    constructor(prisma: PrismaService, realtime: RealtimeGateway);
    listFloors(branchId: string): import("@prisma/client").Prisma.PrismaPromise<({
        tables: ({
            assignedWaiter: {
                id: string;
                name: string;
            } | null;
        } & {
            number: string;
            id: string;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            qrToken: string | null;
            floorId: string;
            capacity: number;
            status: import("@prisma/client").$Enums.TableStatus;
            statusSince: Date;
            posX: number;
            posY: number;
            width: number;
            height: number;
            rotation: number;
            shape: string;
            color: string | null;
            assignedWaiterId: string | null;
            notes: string | null;
        })[];
    } & {
        id: string;
        name: string;
        branchId: string;
        sortOrder: number;
    })[]>;
    createFloor(branchId: string, dto: FloorDto): import("@prisma/client").Prisma.Prisma__FloorClient<{
        id: string;
        name: string;
        branchId: string;
        sortOrder: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateFloor(branchId: string, id: string, dto: FloorUpdateDto): Promise<{
        id: string;
        name: string;
        branchId: string;
        sortOrder: number;
    }>;
    createTable(branchId: string, dto: TableDto): Promise<{
        number: string;
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        qrToken: string | null;
        floorId: string;
        capacity: number;
        status: import("@prisma/client").$Enums.TableStatus;
        statusSince: Date;
        posX: number;
        posY: number;
        width: number;
        height: number;
        rotation: number;
        shape: string;
        color: string | null;
        assignedWaiterId: string | null;
        notes: string | null;
    }>;
    createTables(branchId: string, dto: BulkTableCreateDto): Promise<{
        number: string;
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        qrToken: string | null;
        floorId: string;
        capacity: number;
        status: import("@prisma/client").$Enums.TableStatus;
        statusSince: Date;
        posX: number;
        posY: number;
        width: number;
        height: number;
        rotation: number;
        shape: string;
        color: string | null;
        assignedWaiterId: string | null;
        notes: string | null;
    }[]>;
    updateTable(branchId: string, id: string, dto: TableUpdateDto): Promise<{
        number: string;
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        qrToken: string | null;
        floorId: string;
        capacity: number;
        status: import("@prisma/client").$Enums.TableStatus;
        statusSince: Date;
        posX: number;
        posY: number;
        width: number;
        height: number;
        rotation: number;
        shape: string;
        color: string | null;
        assignedWaiterId: string | null;
        notes: string | null;
    }>;
    updateTableLayout(branchId: string, updates: TableLayoutUpdateDto[]): Promise<{
        number: string;
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        qrToken: string | null;
        floorId: string;
        capacity: number;
        status: import("@prisma/client").$Enums.TableStatus;
        statusSince: Date;
        posX: number;
        posY: number;
        width: number;
        height: number;
        rotation: number;
        shape: string;
        color: string | null;
        assignedWaiterId: string | null;
        notes: string | null;
    }[]>;
    updateTableStatus(branchId: string, id: string, status: TableStatusDto, assignedWaiterId?: string): Promise<{
        number: string;
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        qrToken: string | null;
        floorId: string;
        capacity: number;
        status: import("@prisma/client").$Enums.TableStatus;
        statusSince: Date;
        posX: number;
        posY: number;
        width: number;
        height: number;
        rotation: number;
        shape: string;
        color: string | null;
        assignedWaiterId: string | null;
        notes: string | null;
    }>;
    deleteTable(branchId: string, id: string): Promise<{
        ok: boolean;
    }>;
    rotateQrToken(branchId: string, id: string): Promise<{
        number: string;
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        qrToken: string | null;
        floorId: string;
        capacity: number;
        status: import("@prisma/client").$Enums.TableStatus;
        statusSince: Date;
        posX: number;
        posY: number;
        width: number;
        height: number;
        rotation: number;
        shape: string;
        color: string | null;
        assignedWaiterId: string | null;
        notes: string | null;
    }>;
    private assertFloorInBranch;
    private assertTableInBranch;
    listOpenRequests(branchId: string): import("@prisma/client").Prisma.PrismaPromise<({
        table: {
            number: string;
            id: string;
            name: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        branchId: string;
        type: import("@prisma/client").$Enums.TableRequestType;
        tableId: string;
        resolvedAt: Date | null;
    })[]>;
    resolveRequest(branchId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        branchId: string;
        type: import("@prisma/client").$Enums.TableRequestType;
        tableId: string;
        resolvedAt: Date | null;
    }>;
}
