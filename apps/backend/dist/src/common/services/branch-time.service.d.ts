import { PrismaService } from '../../prisma/prisma.service';
export declare class BranchTimeService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    tzForBranch(branchId: string): Promise<string>;
    tzForRestaurant(restaurantId: string): Promise<string>;
}
