export declare const round2: (n: number) => number;
export interface CouponRule {
    kind: 'PERCENT' | 'FLAT';
    value: number;
    minOrderAmount: number;
    maxDiscount: number | null;
    validFrom: Date | null;
    validUntil: Date | null;
    usageLimit: number | null;
    usedCount: number;
    isActive: boolean;
}
export interface PromotionRule {
    kind: 'PERCENT' | 'FLAT';
    value: number;
    daysOfWeek: number[];
    startMinute: number;
    endMinute: number;
    isActive: boolean;
}
export declare function discountAmount(kind: 'PERCENT' | 'FLAT', value: number, subtotal: number, maxDiscount?: number | null): number;
export declare function evaluateCoupon(coupon: CouponRule, subtotal: number, now: Date): {
    ok: true;
    amount: number;
} | {
    ok: false;
    reason: string;
};
export declare function promotionActive(p: PromotionRule, day: number, minute: number): boolean;
export declare const toMinutes: (hhmm: string) => number;
export declare const fromMinutes: (min: number) => string;
