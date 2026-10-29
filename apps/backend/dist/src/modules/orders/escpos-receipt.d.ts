import { type TaxMode, type TaxRegime } from '@nodedr-restaurant/types';
import { type PrinterProfile } from './escpos/encoder';
export { resolveProfile, type PrinterProfile } from './escpos/encoder';
export interface PrintResult {
    buffer: Buffer;
    unsupportedChars: string[];
}
export interface ReceiptVerifactu {
    url: string;
    heading: string;
    legend: string;
    short: string;
    invoiceNumber: string;
}
export interface EscposReceiptOrder {
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
export declare function discountLabel(percent?: number): string;
interface JobFormat {
    profile?: PrinterProfile;
    timeZone?: string;
    locale?: string;
}
export declare function buildReceiptEscPosJob({ restaurantName, branch, currency, order, openDrawer, profile, timeZone, locale, }: {
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
    order: EscposReceiptOrder;
    openDrawer?: boolean;
} & JobFormat): PrintResult;
export interface EscposKotOrder {
    orderNumber: string;
    type: string;
    createdAt: Date;
    table: {
        label: string;
    } | null;
    customer: {
        name: string;
    } | null;
    notes?: string | null;
    items: {
        nameSnapshot: string;
        quantity: number;
        kitchenNote: string | null;
        modifiers: {
            nameSnapshot: string;
        }[];
    }[];
}
export interface KotTicketInfo {
    number: string;
    station?: string | null;
    reprint?: number;
}
export declare function buildKotEscPosJob({ branchName, order, ticket, profile, timeZone, locale, }: {
    branchName: string;
    order: EscposKotOrder;
    ticket?: KotTicketInfo;
} & JobFormat): PrintResult;
export declare function buildReceiptEscPos(args: Parameters<typeof buildReceiptEscPosJob>[0]): Buffer;
export declare function buildKotEscPos(args: Parameters<typeof buildKotEscPosJob>[0]): Buffer;
export declare function buildOpenDrawer(): Buffer;
export declare function buildTestSlip(profile?: PrinterProfile): Buffer;
export declare function buildKotTestSlip(profile?: PrinterProfile, branchName?: string): PrintResult;
