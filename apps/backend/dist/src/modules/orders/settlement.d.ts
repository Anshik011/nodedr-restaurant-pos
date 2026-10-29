import { type PricedLine } from './pricing';
export interface BillInput {
    lines: PricedLine[];
    discountPercent?: number;
    discountFlat?: number;
    autoDiscount?: number;
    loyaltyDiscountRequested?: number;
    tip?: number;
    deliveryFee?: number;
}
export interface Bill {
    subtotal: number;
    discountAmount: number;
    discountPercent: number;
    taxAmount: number;
    loyaltyDiscountAmount: number;
    tipAmount: number;
    deliveryFee: number;
    totalDue: number;
}
export declare function computeBill(input: BillInput): Bill;
export declare function discountPercentOf(subtotal: number, discountAmount: number): number;
export declare function manualDiscountEntry(percent: number, flat: number): {
    type: 'PERCENT' | 'FIXED';
    value: number;
} | null;
export interface PaymentLineInput {
    method: string;
    amount: number;
    tendered?: number;
    reference?: string;
}
export interface SettledPayment {
    method: string;
    amount: number;
    tendered: number | null;
    changeGiven: number | null;
    reference?: string;
}
export interface Settlement {
    payments: SettledPayment[];
    paidNow: number;
    balanceAfter: number;
    changeDue: number;
    fullyPaid: boolean;
}
export declare function settlePayments(args: {
    balance: number;
    payments: PaymentLineInput[];
    giftCardApplied?: number;
    allowPartial?: boolean;
}): Settlement;
