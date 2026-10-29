interface KotOrder {
    orderNumber: string;
    type: string;
    createdAt: Date;
    table: {
        label: string;
    } | null;
    customer: {
        name: string;
    } | null;
    items: {
        nameSnapshot: string;
        quantity: number;
        kitchenNote: string | null;
        modifiers: {
            nameSnapshot: string;
        }[];
    }[];
}
export declare function buildKotHtml({ branchName, order, }: {
    branchName: string;
    order: KotOrder;
}): string;
export {};
