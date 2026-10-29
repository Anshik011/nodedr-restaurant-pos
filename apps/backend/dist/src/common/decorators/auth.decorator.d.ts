import type { PermissionKey } from '@nodedr-restaurant/types';
export declare const Auth: (...permissions: PermissionKey[]) => <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
