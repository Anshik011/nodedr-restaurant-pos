"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.planStockUsage = planStockUsage;
const r3 = (n) => Math.round((n + Number.EPSILON) * 1000) / 1000;
function planStockUsage(lines, items, combos) {
    const componentsByCombo = new Map();
    for (const c of combos) {
        const list = componentsByCombo.get(c.comboItemId) ?? [];
        list.push(c);
        componentsByCombo.set(c.comboItemId, list);
    }
    const units = new Map();
    const add = (id, q) => units.set(id, (units.get(id) ?? 0) + q);
    for (const line of lines) {
        if (line.quantity <= 0)
            continue;
        const item = items.get(line.menuItemId);
        if (item?.isCombo) {
            for (const c of componentsByCombo.get(item.id) ?? []) {
                add(c.componentItemId, c.quantity * line.quantity);
            }
        }
        else {
            add(line.menuItemId, line.quantity);
        }
    }
    const needs = new Map();
    const skipped = [];
    const need = (ingredientId, q) => needs.set(ingredientId, r3((needs.get(ingredientId) ?? 0) + q));
    for (const [id, sold] of units) {
        const item = items.get(id);
        if (!item) {
            skipped.push({ menuItemId: id, name: id, reason: 'UNKNOWN_ITEM' });
            continue;
        }
        if (item.tracking === 'NONE')
            continue;
        if (item.tracking === 'DIRECT') {
            if (!item.stockIngredientId || item.stockQuantityPerSale <= 0) {
                skipped.push({
                    menuItemId: id,
                    name: item.name,
                    reason: 'NO_STOCK_ITEM',
                });
                continue;
            }
            need(item.stockIngredientId, item.stockQuantityPerSale * sold);
            continue;
        }
        if (item.recipe.length === 0) {
            skipped.push({ menuItemId: id, name: item.name, reason: 'NO_RECIPE' });
            continue;
        }
        for (const line of item.recipe)
            need(line.ingredientId, line.quantity * sold);
    }
    return { needs, skipped };
}
//# sourceMappingURL=stock-plan.js.map