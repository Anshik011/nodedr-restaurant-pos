import type { ReceiptVerifactu } from './escpos-receipt';
import { type TaxMode, type TaxRegime } from '@nodedr-restaurant/types';
interface ReceiptOrder {
    verifactu?: ReceiptVerifactu | null;
    orderNumber: string;
    type: string;
    createdAt: Date;
    table: {
        label: string;
    } | null;
    customer: {
        name: string;
        phone: string | null;
    } | null;
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    tipAmount: number;
    loyaltyPointsRedeemed: number;
    loyaltyDiscountAmount: number;
    totalAmount: number;
    discountPercent?: number;
    isProvisional?: boolean;
    amountPaid?: number;
    balanceDue?: number;
    items: {
        nameSnapshot: string;
        quantity: number;
        unitPriceSnapshot: number;
        lineTotal: number;
        taxRateSnapshot: number;
        modifiers: {
            nameSnapshot: string;
            priceAdjSnapshot: number;
        }[];
    }[];
    payments: {
        method: string;
        amount: number;
        tendered?: number | null;
        changeGiven?: number | null;
    }[];
}
export declare function buildReceiptHtml({ restaurantName, branch, currency, order, }: {
    restaurantName: string;
    branch: {
        name: string;
        address: string | null;
        phone: string | null;
        gstNumber: string | null;
        taxRegime: TaxRegime;
        taxMode: TaxMode;
        taxLabel: string | null;
        taxId: string | null;
    };
    currency: string;
    order: ReceiptOrder;
}): string;
export {};
