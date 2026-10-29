export declare const PERMISSIONS: readonly [{
    readonly key: "sales.view";
    readonly label: "View Sales";
    readonly category: "Sales";
}, {
    readonly key: "dashboard.sales.view";
    readonly label: "View Dashboard Revenue & Sales Reports";
    readonly category: "Sales";
}, {
    readonly key: "orders.create";
    readonly label: "Create Orders";
    readonly category: "Orders";
}, {
    readonly key: "orders.edit";
    readonly label: "Edit Orders";
    readonly category: "Orders";
}, {
    readonly key: "orders.cancel";
    readonly label: "Cancel Orders";
    readonly category: "Orders";
}, {
    readonly key: "orders.accept";
    readonly label: "Accept / Decline Incoming Orders";
    readonly category: "Orders";
}, {
    readonly key: "discounts.apply";
    readonly label: "Apply Discounts";
    readonly category: "Orders";
}, {
    readonly key: "refunds.process";
    readonly label: "Process Refunds";
    readonly category: "Orders";
}, {
    readonly key: "orders.delete";
    readonly label: "Delete Past Transactions (admin password)";
    readonly category: "Orders";
}, {
    readonly key: "bills.print";
    readonly label: "Print Bills";
    readonly category: "Orders";
}, {
    readonly key: "tables.view";
    readonly label: "View Floors & Tables (read-only)";
    readonly category: "Tables";
}, {
    readonly key: "tables.manage";
    readonly label: "Manage Tables";
    readonly category: "Tables";
}, {
    readonly key: "menu.view";
    readonly label: "View Menu (read-only)";
    readonly category: "Menu";
}, {
    readonly key: "menu.manage";
    readonly label: "Manage Menu";
    readonly category: "Menu";
}, {
    readonly key: "inventory.manage";
    readonly label: "Manage Inventory";
    readonly category: "Inventory";
}, {
    readonly key: "reports.access";
    readonly label: "Access Reports";
    readonly category: "Reports";
}, {
    readonly key: "users.manage";
    readonly label: "Manage Users";
    readonly category: "Admin";
}, {
    readonly key: "reports.financial.view";
    readonly label: "View Financial Reports";
    readonly category: "Reports";
}, {
    readonly key: "data.export";
    readonly label: "Export Data";
    readonly category: "Reports";
}, {
    readonly key: "kds.manage";
    readonly label: "Manage Kitchen Display";
    readonly category: "Kitchen";
}, {
    readonly key: "reservations.manage";
    readonly label: "Manage Reservations";
    readonly category: "Reservations";
}, {
    readonly key: "settings.manage";
    readonly label: "Manage Settings";
    readonly category: "Admin";
}, {
    readonly key: "customers.manage";
    readonly label: "Manage Customers & Loyalty";
    readonly category: "CRM";
}, {
    readonly key: "audit_log.view";
    readonly label: "View Audit Log";
    readonly category: "Admin";
}, {
    readonly key: "roles.manage";
    readonly label: "Manage Roles";
    readonly category: "Admin";
}, {
    readonly key: "backup.manage";
    readonly label: "Manage Backups";
    readonly category: "Admin";
}, {
    readonly key: "attendance.manage";
    readonly label: "Manage Staff Attendance";
    readonly category: "Staff";
}, {
    readonly key: "delivery.manage";
    readonly label: "Manage Deliveries";
    readonly category: "Delivery";
}, {
    readonly key: "staff.manage";
    readonly label: "Manage Staff Schedules, Leave & Payroll";
    readonly category: "Staff";
}, {
    readonly key: "accounting.manage";
    readonly label: "Manage Accounting";
    readonly category: "Accounting";
}, {
    readonly key: "marketing.manage";
    readonly label: "Manage Coupons, Promotions & Campaigns";
    readonly category: "Marketing";
}, {
    readonly key: "operations.manage";
    readonly label: "Manage Equipment & Documents";
    readonly category: "Operations";
}, {
    readonly key: "system.update";
    readonly label: "Manage App Updates";
    readonly category: "Admin";
}];
export type PermissionKey = (typeof PERMISSIONS)[number]["key"];
export declare const PERMISSION_IMPLIES: Partial<Record<PermissionKey, PermissionKey[]>>;
/** True when `held` satisfies `required`, directly or through PERMISSION_IMPLIES. */
export declare function permissionSatisfied(held: readonly string[], required: string): boolean;
export declare const SALES_DASHBOARD_DEFAULT_ROLES: readonly ["OWNER", "ADMINISTRATOR", "ACCOUNTANT", "CASHIER"];
export declare const STAFF_ROLES: readonly ["OWNER", "ADMINISTRATOR", "RESTAURANT_MANAGER", "CASHIER", "WAITER", "KITCHEN_STAFF", "CHEF", "BARTENDER", "DELIVERY_STAFF", "ACCOUNTANT", "INVENTORY_MANAGER"];
export type StaffRole = (typeof STAFF_ROLES)[number];
export declare const DEFAULT_ROLE_PERMISSIONS: Record<StaffRole, PermissionKey[]>;
