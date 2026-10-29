import type { Prisma } from '@prisma/client';
import type { IngredientDto, SupplierDto, RecipeLineDto, MenuItemTrackingDto } from '@nodedr-restaurant/types';
import { PrismaService } from '../../prisma/prisma.service';
import { StockService } from './stock.service';
import { type StockPlan } from './stock-plan';
type Tx = Prisma.TransactionClient;
export declare class InventoryService {
    private readonly prisma;
    private readonly stockService;
    constructor(prisma: PrismaService, stockService: StockService);
    listIngredients(branchId: string): Prisma.PrismaPromise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        branchId: string;
        sku: string | null;
        unit: import("@prisma/client").$Enums.IngredientUnit;
        reorderLevel: Prisma.Decimal;
        currentStock: Prisma.Decimal;
        costPerUnit: Prisma.Decimal;
    }[]>;
    getIngredient(branchId: string, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        branchId: string;
        sku: string | null;
        unit: import("@prisma/client").$Enums.IngredientUnit;
        reorderLevel: Prisma.Decimal;
        currentStock: Prisma.Decimal;
        costPerUnit: Prisma.Decimal;
    }>;
    createIngredient(branchId: string, dto: IngredientDto): Prisma.Prisma__IngredientClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        branchId: string;
        sku: string | null;
        unit: import("@prisma/client").$Enums.IngredientUnit;
        reorderLevel: Prisma.Decimal;
        currentStock: Prisma.Decimal;
        costPerUnit: Prisma.Decimal;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    updateIngredient(branchId: string, id: string, dto: Partial<IngredientDto>): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        branchId: string;
        sku: string | null;
        unit: import("@prisma/client").$Enums.IngredientUnit;
        reorderLevel: Prisma.Decimal;
        currentStock: Prisma.Decimal;
        costPerUnit: Prisma.Decimal;
    }>;
    deleteIngredient(branchId: string, id: string): Promise<{
        ok: boolean;
    }>;
    lowStockIngredients(branchId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        branchId: string;
        sku: string | null;
        unit: import("@prisma/client").$Enums.IngredientUnit;
        reorderLevel: Prisma.Decimal;
        currentStock: Prisma.Decimal;
        costPerUnit: Prisma.Decimal;
    }[]>;
    listSuppliers(branchId: string): Prisma.PrismaPromise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
        phone: string | null;
        gstNumber: string | null;
        isActive: boolean;
        email: string | null;
        branchId: string;
        notes: string | null;
        contactName: string | null;
    }[]>;
    getSupplier(branchId: string, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
        phone: string | null;
        gstNumber: string | null;
        isActive: boolean;
        email: string | null;
        branchId: string;
        notes: string | null;
        contactName: string | null;
    }>;
    createSupplier(branchId: string, dto: SupplierDto): Prisma.Prisma__SupplierClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
        phone: string | null;
        gstNumber: string | null;
        isActive: boolean;
        email: string | null;
        branchId: string;
        notes: string | null;
        contactName: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    updateSupplier(branchId: string, id: string, dto: Partial<SupplierDto>): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
        phone: string | null;
        gstNumber: string | null;
        isActive: boolean;
        email: string | null;
        branchId: string;
        notes: string | null;
        contactName: string | null;
    }>;
    deleteSupplier(branchId: string, id: string): Promise<{
        ok: boolean;
    }>;
    getRecipe(branchId: string, menuItemId: string): Promise<{
        lines: {
            id: string;
            ingredientId: string;
            ingredientName: string;
            unit: import("@prisma/client").$Enums.IngredientUnit;
            quantity: number;
            costPerUnit: number;
            lineCost: number;
        }[];
        totalCost: number;
    }>;
    setRecipe(branchId: string, menuItemId: string, lines: RecipeLineDto[]): Promise<{
        lines: {
            id: string;
            ingredientId: string;
            ingredientName: string;
            unit: import("@prisma/client").$Enums.IngredientUnit;
            quantity: number;
            costPerUnit: number;
            lineCost: number;
        }[];
        totalCost: number;
    }>;
    getTracking(branchId: string, menuItemId: string): Promise<{
        stockQuantityPerSale: number;
        id: string;
        isCombo: boolean;
        inventoryTracking: import("@prisma/client").$Enums.InventoryTracking;
        stockIngredientId: string | null;
    }>;
    setTracking(branchId: string, menuItemId: string, dto: MenuItemTrackingDto): Promise<{
        stockQuantityPerSale: number;
        id: string;
        isCombo: boolean;
        inventoryTracking: import("@prisma/client").$Enums.InventoryTracking;
        stockIngredientId: string | null;
    }>;
    private assertMenuItemInBranch;
    deductForOrder(tx: Tx, branchId: string, userId: string, orderId: string, lines: {
        menuItemId: string;
        quantity: number;
    }[]): Promise<{
        skipped: StockPlan['skipped'];
    }>;
    restoreForReturn(tx: Tx, branchId: string, userId: string, orderId: string, lines: {
        menuItemId: string;
        quantity: number;
    }[]): Promise<{
        restored: number;
    }>;
    private planFor;
    trackingSetupStatus(branchId: string): Promise<{
        tracked: number;
        untracked: number;
        problems: {
            menuItemId: string;
            name: string;
            reason: import("./stock-plan").SkipReason;
        }[];
    }>;
}
export {};
