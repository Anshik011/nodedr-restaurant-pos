import { type SessionUser } from '@nodedr-restaurant/types';
import { BranchAccessService } from '../../common/services/branch-access.service';
import { MenuService } from './menu.service';
export declare class MenuController {
    private readonly menuService;
    private readonly branchAccess;
    constructor(menuService: MenuService, branchAccess: BranchAccessService);
    listCategories(user: SessionUser, branchId: string): Promise<({
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
    createCategory(user: SessionUser, branchId: string, body: unknown): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        branchId: string;
        sortOrder: number;
        showOnWebsite: boolean;
    }>;
    updateCategory(user: SessionUser, branchId: string, id: string, body: unknown): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        branchId: string;
        sortOrder: number;
        showOnWebsite: boolean;
    }>;
    deleteCategory(user: SessionUser, branchId: string, id: string): Promise<{
        ok: boolean;
    }>;
    listStations(user: SessionUser, branchId: string): Promise<{
        id: string;
        name: string;
        branchId: string;
        printerName: string | null;
    }[]>;
    createStation(user: SessionUser, branchId: string, body: {
        name: string;
        printerName?: string;
    }): Promise<{
        id: string;
        name: string;
        branchId: string;
        printerName: string | null;
    }>;
    listItems(user: SessionUser, branchId: string, categoryId?: string): Promise<({
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
    getItem(user: SessionUser, branchId: string, id: string): Promise<{
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
    createItem(user: SessionUser, branchId: string, body: unknown): Promise<{
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
    uploadItemImage(file?: Express.Multer.File): {
        url: string;
    };
    updateItem(user: SessionUser, branchId: string, id: string, body: unknown): Promise<{
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
    deleteItem(user: SessionUser, branchId: string, id: string): Promise<{
        ok: boolean;
    }>;
    listModifierGroups(user: SessionUser, branchId: string): Promise<({
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
    createModifierGroup(user: SessionUser, branchId: string, body: unknown): Promise<{
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
    updateModifierGroup(user: SessionUser, branchId: string, id: string, body: unknown): Promise<{
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
    deleteModifierGroup(user: SessionUser, branchId: string, id: string): Promise<{
        ok: boolean;
    }>;
    getComboComponents(user: SessionUser, branchId: string, id: string): Promise<({
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
    setComboComponents(user: SessionUser, branchId: string, id: string, body: unknown): Promise<({
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
