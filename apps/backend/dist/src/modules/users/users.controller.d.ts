import { type SessionUser } from '@nodedr-restaurant/types';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    list(user: SessionUser): import("@prisma/client").Prisma.PrismaPromise<{
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
    listRoles(user: SessionUser): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        label: string;
        name: string;
        createdAt: Date;
        restaurantId: string;
        isSystem: boolean;
    }[]>;
    create(user: SessionUser, body: unknown): Promise<{
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
    update(user: SessionUser, id: string, body: unknown): Promise<{
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
    remove(user: SessionUser, id: string): Promise<{
        ok: boolean;
    }>;
}
