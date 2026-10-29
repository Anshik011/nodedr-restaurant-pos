import { JwtService } from '@nestjs/jwt';
import { type LoginDto, type PinLoginDto, type RegisterDto } from '@nodedr-restaurant/types';
import { PrismaService } from '../prisma/prisma.service';
import { TwoFactorService } from './two-factor.service';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly twoFactor;
    constructor(prisma: PrismaService, jwt: JwtService, twoFactor: TwoFactorService);
    private toSessionUser;
    login(dto: LoginDto): Promise<{
        token: string;
        user: {
            id: string;
            restaurantId: string;
            name: string;
            roleId: string;
            roleName: string;
            permissions: string[];
        };
    }>;
    register(dto: RegisterDto): Promise<{
        token: string;
        user: {
            id: string;
            restaurantId: string;
            name: string;
            roleId: string;
            roleName: string;
            permissions: string[];
        };
    }>;
    hasAnyRestaurant(): Promise<boolean>;
    pinLogin(dto: PinLoginDto): Promise<{
        token: string;
        user: {
            id: string;
            restaurantId: string;
            name: string;
            roleId: string;
            roleName: string;
            permissions: string[];
        };
    }>;
    private issueSession;
}
