import { type SessionUser, type TableLayoutUpdateDto } from '@nodedr-restaurant/types';
import { BranchAccessService } from '../../common/services/branch-access.service';
import { TablesService } from './tables.service';
export declare class TablesController {
    private readonly tablesService;
    private readonly branchAccess;
    constructor(tablesService: TablesService, branchAccess: BranchAccessService);
    listRequests(user: SessionUser, branchId: string): Promise<({
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
    resolveRequest(user: SessionUser, branchId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        branchId: string;
        type: import("@prisma/client").$Enums.TableRequestType;
        tableId: string;
        resolvedAt: Date | null;
    }>;
    listFloors(user: SessionUser, branchId: string): Promise<({
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
    createFloor(user: SessionUser, branchId: string, body: unknown): Promise<{
        id: string;
        name: string;
        branchId: string;
        sortOrder: number;
    }>;
    createTable(user: SessionUser, branchId: string, body: unknown): Promise<{
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
    createTables(user: SessionUser, branchId: string, body: unknown): Promise<{
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
    updateFloor(user: SessionUser, branchId: string, id: string, body: unknown): Promise<{
        id: string;
        name: string;
        branchId: string;
        sortOrder: number;
    }>;
    updateLayout(user: SessionUser, branchId: string, body: TableLayoutUpdateDto[]): Promise<{
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
    updateTable(user: SessionUser, branchId: string, id: string, body: unknown): Promise<{
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
    updateStatus(user: SessionUser, branchId: string, id: string, body: {
        status: never;
        assignedWaiterId?: string;
    }): Promise<{
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
    rotateQrToken(user: SessionUser, branchId: string, id: string): Promise<{
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
    deleteTable(user: SessionUser, branchId: string, id: string): Promise<{
        ok: boolean;
    }>;
}
