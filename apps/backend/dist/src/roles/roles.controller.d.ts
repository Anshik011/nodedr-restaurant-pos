import { type SessionUser } from '@nodedr-restaurant/types';
import { RolesService } from './roles.service';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    list(user: SessionUser): import("@prisma/client").Prisma.PrismaPromise<{
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
    create(user: SessionUser, body: unknown): Promise<{
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
    update(user: SessionUser, id: string, body: unknown): Promise<{
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
    remove(user: SessionUser, id: string): Promise<{
        ok: boolean;
    }>;
}
