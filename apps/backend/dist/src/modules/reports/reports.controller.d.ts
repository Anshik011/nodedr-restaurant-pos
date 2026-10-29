import type { Response } from 'express';
import type { SessionUser } from '@nodedr-restaurant/types';
import { BranchAccessService } from '../../common/services/branch-access.service';
import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reports;
    private readonly branchAccess;
    constructor(reports: ReportsService, branchAccess: BranchAccessService);
    catalog(u: SessionUser): ({
        readonly key: "sales-daily";
        readonly title: "Daily sales";
        readonly group: "Sales";
    } | {
        readonly key: "sales-by-item";
        readonly title: "Sales by item";
        readonly group: "Sales";
    } | {
        readonly key: "sales-by-category";
        readonly title: "Sales by category";
        readonly group: "Sales";
    } | {
        readonly key: "popular-items";
        readonly title: "Popular items";
        readonly group: "Sales";
    } | {
        readonly key: "slow-movers";
        readonly title: "Slow movers";
        readonly group: "Sales";
    } | {
        readonly key: "payment-methods";
        readonly title: "Payment methods";
        readonly group: "Sales";
    } | {
        readonly key: "discounts";
        readonly title: "Discounts & coupons";
        readonly group: "Sales";
    } | {
        readonly key: "tax";
        readonly title: "Tax (GST) summary";
        readonly group: "Tax";
    } | {
        readonly key: "peak-hours";
        readonly title: "Peak hours";
        readonly group: "Analytics";
    } | {
        readonly key: "food-cost";
        readonly title: "Food cost & margins";
        readonly group: "Analytics";
    } | {
        readonly key: "customers";
        readonly title: "Top customers";
        readonly group: "Customers";
    } | {
        readonly key: "retention";
        readonly title: "New vs returning customers";
        readonly group: "Customers";
    } | {
        readonly key: "staff-sales";
        readonly title: "Staff sales";
        readonly group: "Staff";
    } | {
        readonly key: "table-turnover";
        readonly title: "Table turnover";
        readonly group: "Operations";
    } | {
        readonly key: "reservations";
        readonly title: "Reservations";
        readonly group: "Operations";
    } | {
        readonly key: "delivery";
        readonly title: "Deliveries";
        readonly group: "Operations";
    } | {
        readonly key: "waste";
        readonly title: "Waste";
        readonly group: "Inventory";
    } | {
        readonly key: "inventory-valuation";
        readonly title: "Inventory valuation";
        readonly group: "Inventory";
    })[];
    run(u: SessionUser, key: string, branchId: string, from: string, to: string): Promise<import("./reports.service").ReportResult>;
    csv(u: SessionUser, key: string, branchId: string, from: string, to: string): Promise<string>;
    export(u: SessionUser, key: string, branchId: string, from: string, to: string, format: string | undefined, res: Response): Promise<void>;
}
