import { type SessionUser } from '@nodedr-restaurant/types';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { TwoFactorService } from './two-factor.service';
export declare class AuthController {
    private readonly authService;
    private readonly twoFactor;
    constructor(authService: AuthService, twoFactor: TwoFactorService);
    register(body: unknown, res: Response): Promise<{
        user: {
            id: string;
            restaurantId: string;
            name: string;
            roleId: string;
            roleName: string;
            permissions: string[];
        };
    }>;
    login(body: unknown, res: Response): Promise<{
        user: {
            id: string;
            restaurantId: string;
            name: string;
            roleId: string;
            roleName: string;
            permissions: string[];
        };
    }>;
    pinLogin(body: unknown, res: Response): Promise<{
        user: {
            id: string;
            restaurantId: string;
            name: string;
            roleId: string;
            roleName: string;
            permissions: string[];
        };
    }>;
    logout(res: Response): {
        ok: boolean;
    };
    twoFactorStatus(user: SessionUser): Promise<{
        enabled: boolean;
        recoveryCodesLeft: number;
    }>;
    twoFactorSetup(user: SessionUser): Promise<{
        secret: string;
        otpauthUrl: string;
    }>;
    twoFactorEnable(user: SessionUser, body: {
        code: string;
    }): Promise<{
        recoveryCodes: string[];
    }>;
    twoFactorDisable(user: SessionUser, body: {
        password: string;
        code: string;
    }): Promise<{
        ok: boolean;
    }>;
    twoFactorReset(user: SessionUser, userId: string): Promise<{
        ok: boolean;
    }>;
    me(user: unknown): {
        user: unknown;
    };
    setupStatus(): Promise<{
        isSetup: boolean;
    }>;
    private setSessionCookie;
}
