import type { CreateRoleDto, UpdateRoleDto } from '@nodedr-restaurant/types';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class RolesService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    list(restaurantId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        label: string;
        name: string;
        createdAt: Date;
        isSystem: boolean;
        permissions: {
            permission: {
                key: string;
                label: string;
                category: string;
            };
        }[];
    }[]>;
    create(restaurantId: string, actorId: string, dto: CreateRoleDto): Promise<{
        id: string;
        label: string;
        name: string;
        createdAt: Date;
        isSystem: boolean;
        permissions: {
            permission: {
                key: string;
                label: string;
                category: string;
            };
        }[];
    }>;
    update(restaurantId: string, actorId: string, id: string, dto: UpdateRoleDto): Promise<{
        id: string;
        label: string;
        name: string;
        createdAt: Date;
        isSystem: boolean;
        permissions: {
            permission: {
                key: string;
                label: string;
                category: string;
            };
        }[];
    }>;
    remove(restaurantId: string, actorId: string, id: string): Promise<{
        ok: boolean;
    }>;
    private getForRestaurant;
    private assertPermissionKeysValid;
}
