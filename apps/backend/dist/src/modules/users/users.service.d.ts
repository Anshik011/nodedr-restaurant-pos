import type { CreateStaffDto, UpdateStaffDto } from '@nodedr-restaurant/types';
import { Prisma } from '@prisma/client';
import { AuditService } from '../../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
export declare class UsersService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    list(restaurantId: string): Prisma.PrismaPromise<{
        id: string;
        name: string;
        createdAt: Date;
        branches: {
            branch: {
                id: string;
                name: string;
            };
        }[];
        phone: string | null;
        isActive: boolean;
        role: {
            id: string;
            label: string;
            name: string;
        };
        roleId: string;
        email: string | null;
    }[]>;
    listRoles(restaurantId: string): Prisma.PrismaPromise<{
        id: string;
        label: string;
        name: string;
        createdAt: Date;
        restaurantId: string;
        isSystem: boolean;
    }[]>;
    create(restaurantId: string, actorId: string, dto: CreateStaffDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        branches: {
            branch: {
                id: string;
                name: string;
            };
        }[];
        phone: string | null;
        isActive: boolean;
        role: {
            id: string;
            label: string;
            name: string;
        };
        roleId: string;
        email: string | null;
    }>;
    update(restaurantId: string, actorId: string, id: string, dto: UpdateStaffDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        branches: {
            branch: {
                id: string;
                name: string;
            };
        }[];
        phone: string | null;
        isActive: boolean;
        role: {
            id: string;
            label: string;
            name: string;
        };
        roleId: string;
        email: string | null;
    }>;
    remove(restaurantId: string, actorId: string, id: string): Promise<{
        ok: boolean;
    }>;
    private assertRoleInRestaurant;
    private assertBranchesInRestaurant;
}
