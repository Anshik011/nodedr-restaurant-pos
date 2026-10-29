export declare const round2: (n: number) => number;
export interface PayInput {
    userId: string;
    payType: 'MONTHLY' | 'HOURLY';
    rate: number;
    hoursWorked: number;
    unpaidLeaveDays: number;
}
export interface PayLineResult {
    userId: string;
    hoursWorked: number;
    basePay: number;
    tipShare: number;
    unpaidLeaveDeduction: number;
    netPay: number;
}
export declare function daysInclusive(start: string, end: string): number;
export declare function daysInMonthOf(date: string): number;
export declare function computePayroll(periodStart: string, periodEnd: string, tipPool: number, staff: PayInput[]): PayLineResult[];
