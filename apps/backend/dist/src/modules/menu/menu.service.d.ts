import type { MenuCategoryDto, MenuItemDto, ModifierGroupDto } from '@nodedr-restaurant/types';
import { AuditService } from '../../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
export declare class MenuService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    listCategories(branchId: string): import("@prisma/client").Prisma.PrismaPromise<({
        _count: {
            items: number;
        };
    } & {
        id: string;
        name: string;
        isActive: boolean;
        branchId: string;
        sortOrder: number;
        showOnWebsite: boolean;
    })[]>;
    createCategory(branchId: string, dto: MenuCategoryDto): import("@prisma/client").Prisma.Prisma__MenuCategoryClient<{
        id: string;
        name: string;
        isActive: boolean;
        branchId: string;
        sortOrder: number;
        showOnWebsite: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateCategory(branchId: string, id: string, dto: Partial<MenuCategoryDto>): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        branchId: string;
        sortOrder: number;
        showOnWebsite: boolean;
    }>;
    deleteCategory(branchId: string, id: string): Promise<{
        ok: boolean;
    }>;
    private assertCategoryInBranch;
    listStations(branchId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        branchId: string;
        printerName: string | null;
    }[]>;
    createStation(branchId: string, name: string, printerName?: string): import("@prisma/client").Prisma.Prisma__KitchenStationClient<{
        id: string;
        name: string;
        branchId: string;
        printerName: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    listItems(branchId: string, categoryId?: string): import("@prisma/client").Prisma.PrismaPromise<({
        category: {
            id: string;
            name: string;
            isActive: boolean;
            branchId: string;
            sortOrder: number;
            showOnWebsite: boolean;
        };
        modifierGroups: ({
            modifierGroup: {
                modifiers: {
                    id: string;
                    name: string;
                    sortOrder: number;
                    groupId: string;
                    priceAdjustment: import("@prisma/client/runtime/library").Decimal;
                    taxRatePercent: import("@prisma/client/runtime/library").Decimal | null;
                    kitchenNote: string | null;
                    isDefault: boolean;
                }[];
            } & {
                id: string;
                name: string;
                branchId: string;
                minSelect: number;
                maxSelect: number;
                isRequired: boolean;
            };
        } & {
            sortOrder: number;
            modifierGroupId: string;
            menuItemId: string;
        })[];
        station: {
            id: string;
            name: string;
            branchId: string;
            printerName: string | null;
        } | null;
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        branchId: string;
        sortOrder: number;
        taxRatePercent: import("@prisma/client/runtime/library").Decimal;
        categoryId: string;
        stationId: string | null;
        sku: string | null;
        description: string | null;
        imageUrl: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        costPrice: import("@prisma/client/runtime/library").Decimal | null;
        prepTimeMinutes: number | null;
        calories: number | null;
        isVeg: boolean;
        isVegan: boolean;
        isJain: boolean;
        isHalal: boolean;
        isGlutenFree: boolean;
        spiceLevel: import("@prisma/client").$Enums.SpiceLevel;
        allergens: string[];
        availableFrom: string | null;
        availableTo: string | null;
        isSeasonal: boolean;
        seasonStart: Date | null;
        seasonEnd: Date | null;
        barcode: string | null;
        isCombo: boolean;
        inventoryTracking: import("@prisma/client").$Enums.InventoryTracking;
        stockIngredientId: string | null;
        stockQuantityPerSale: import("@prisma/client/runtime/library").Decimal;
        halfPrice: import("@prisma/client/runtime/library").Decimal | null;
    })[]>;
    getItem(branchId: string, id: string): Promise<{
        modifierGroups: ({
            modifierGroup: {
                modifiers: {
                    id: string;
                    name: string;
                    sortOrder: number;
                    groupId: string;
                    priceAdjustment: import("@prisma/client/runtime/library").Decimal;
                    taxRatePercent: import("@prisma/client/runtime/library").Decimal | null;
                    kitchenNote: string | null;
                    isDefault: boolean;
                }[];
            } & {
                id: string;
                name: string;
                branchId: string;
                minSelect: number;
                maxSelect: number;
                isRequired: boolean;
            };
        } & {
            sortOrder: number;
            modifierGroupId: string;
            menuItemId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        branchId: string;
        sortOrder: number;
        taxRatePercent: import("@prisma/client/runtime/library").Decimal;
        categoryId: string;
        stationId: string | null;
        sku: string | null;
        description: string | null;
        imageUrl: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        costPrice: import("@prisma/client/runtime/library").Decimal | null;
        prepTimeMinutes: number | null;
        calories: number | null;
        isVeg: boolean;
        isVegan: boolean;
        isJain: boolean;
        isHalal: boolean;
        isGlutenFree: boolean;
        spiceLevel: import("@prisma/client").$Enums.SpiceLevel;
        allergens: string[];
        availableFrom: string | null;
        availableTo: string | null;
        isSeasonal: boolean;
        seasonStart: Date | null;
        seasonEnd: Date | null;
        barcode: string | null;
        isCombo: boolean;
        inventoryTracking: import("@prisma/client").$Enums.InventoryTracking;
        stockIngredientId: string | null;
        stockQuantityPerSale: import("@prisma/client/runtime/library").Decimal;
        halfPrice: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    createItem(branchId: string, dto: MenuItemDto): Promise<{
        modifierGroups: ({
            modifierGroup: {
                id: string;
                name: string;
                branchId: string;
                minSelect: number;
                maxSelect: number;
                isRequired: boolean;
            };
        } & {
            sortOrder: number;
            modifierGroupId: string;
            menuItemId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        branchId: string;
        sortOrder: number;
        taxRatePercent: import("@prisma/client/runtime/library").Decimal;
        categoryId: string;
        stationId: string | null;
        sku: string | null;
        description: string | null;
        imageUrl: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        costPrice: import("@prisma/client/runtime/library").Decimal | null;
        prepTimeMinutes: number | null;
        calories: number | null;
        isVeg: boolean;
        isVegan: boolean;
        isJain: boolean;
        isHalal: boolean;
        isGlutenFree: boolean;
        spiceLevel: import("@prisma/client").$Enums.SpiceLevel;
        allergens: string[];
        availableFrom: string | null;
        availableTo: string | null;
        isSeasonal: boolean;
        seasonStart: Date | null;
        seasonEnd: Date | null;
        barcode: string | null;
        isCombo: boolean;
        inventoryTracking: import("@prisma/client").$Enums.InventoryTracking;
        stockIngredientId: string | null;
        stockQuantityPerSale: import("@prisma/client/runtime/library").Decimal;
        halfPrice: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    updateItem(branchId: string, id: string, userId: string, dto: Partial<MenuItemDto>): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        branchId: string;
        sortOrder: number;
        taxRatePercent: import("@prisma/client/runtime/library").Decimal;
        categoryId: string;
        stationId: string | null;
        sku: string | null;
        description: string | null;
        imageUrl: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        costPrice: import("@prisma/client/runtime/library").Decimal | null;
        prepTimeMinutes: number | null;
        calories: number | null;
        isVeg: boolean;
        isVegan: boolean;
        isJain: boolean;
        isHalal: boolean;
        isGlutenFree: boolean;
        spiceLevel: import("@prisma/client").$Enums.SpiceLevel;
        allergens: string[];
        availableFrom: string | null;
        availableTo: string | null;
        isSeasonal: boolean;
        seasonStart: Date | null;
        seasonEnd: Date | null;
        barcode: string | null;
        isCombo: boolean;
        inventoryTracking: import("@prisma/client").$Enums.InventoryTracking;
        stockIngredientId: string | null;
        stockQuantityPerSale: import("@prisma/client/runtime/library").Decimal;
        halfPrice: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    private assertModifierGroupsInBranch;
    deleteItem(branchId: string, id: string): Promise<{
        ok: boolean;
    }>;
    listModifierGroups(branchId: string): import("@prisma/client").Prisma.PrismaPromise<({
        modifiers: {
            id: string;
            name: string;
            sortOrder: number;
            groupId: string;
            priceAdjustment: import("@prisma/client/runtime/library").Decimal;
            taxRatePercent: import("@prisma/client/runtime/library").Decimal | null;
            kitchenNote: string | null;
            isDefault: boolean;
        }[];
    } & {
        id: string;
        name: string;
        branchId: string;
        minSelect: number;
        maxSelect: number;
        isRequired: boolean;
    })[]>;
    createModifierGroup(branchId: string, dto: ModifierGroupDto): import("@prisma/client").Prisma.Prisma__ModifierGroupClient<{
        modifiers: {
            id: string;
            name: string;
            sortOrder: number;
            groupId: string;
            priceAdjustment: import("@prisma/client/runtime/library").Decimal;
            taxRatePercent: import("@prisma/client/runtime/library").Decimal | null;
            kitchenNote: string | null;
            isDefault: boolean;
        }[];
    } & {
        id: string;
        name: string;
        branchId: string;
        minSelect: number;
        maxSelect: number;
        isRequired: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateModifierGroup(branchId: string, id: string, dto: Partial<ModifierGroupDto>): Promise<{
        modifiers: {
            id: string;
            name: string;
            sortOrder: number;
            groupId: string;
            priceAdjustment: import("@prisma/client/runtime/library").Decimal;
            taxRatePercent: import("@prisma/client/runtime/library").Decimal | null;
            kitchenNote: string | null;
            isDefault: boolean;
        }[];
    } & {
        id: string;
        name: string;
        branchId: string;
        minSelect: number;
        maxSelect: number;
        isRequired: boolean;
    }>;
    deleteModifierGroup(branchId: string, id: string): Promise<{
        ok: boolean;
    }>;
    private assertModifierGroupInBranch;
    setComboComponents(branchId: string, comboItemId: string, components: {
        componentItemId: string;
        quantity: number;
    }[]): Promise<({
        componentItem: {
            id: string;
            name: string;
            price: import("@prisma/client/runtime/library").Decimal;
        };
    } & {
        id: string;
        quantity: number;
        comboItemId: string;
        componentItemId: string;
    })[]>;
    getComboComponents(branchId: string, comboItemId: string): Promise<({
        componentItem: {
            id: string;
            name: string;
            price: import("@prisma/client/runtime/library").Decimal;
        };
    } & {
        id: string;
        quantity: number;
        comboItemId: string;
        componentItemId: string;
    })[]>;
}
