export type InventoryTrackingMode = 'NONE' | 'RECIPE' | 'DIRECT';
export interface PlanItem {
    id: string;
    name: string;
    isCombo: boolean;
    tracking: InventoryTrackingMode;
    stockIngredientId: string | null;
    stockQuantityPerSale: number;
    recipe: {
        ingredientId: string;
        quantity: number;
    }[];
}
export interface PlanCombo {
    comboItemId: string;
    componentItemId: string;
    quantity: number;
}
export type SkipReason = 'NO_RECIPE' | 'NO_STOCK_ITEM' | 'UNKNOWN_ITEM';
export interface StockPlan {
    needs: Map<string, number>;
    skipped: {
        menuItemId: string;
        name: string;
        reason: SkipReason;
    }[];
}
export declare function planStockUsage(lines: {
    menuItemId: string;
    quantity: number;
}[], items: ReadonlyMap<string, PlanItem>, combos: readonly PlanCombo[]): StockPlan;
