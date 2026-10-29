import type { PermissionKey } from '@nodedr-restaurant/types';
export declare const PERMISSIONS_KEY = "requiredPermissions";
export declare const RequirePermission: (...permissions: PermissionKey[]) => import("@nestjs/common").CustomDecorator<string>;
