import { PrismaService } from '../../prisma/prisma.service';
export declare class BranchAccessService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    assertAccess(restaurantId: string, branchId: string): Promise<void>;
}
