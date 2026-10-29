"use strict";
// Single source of truth for the granular permission list (spec: "Every
// permission should be individually configurable"). Backend seeds these as
// Permission rows; frontend uses the same keys to gate UI (buttons/routes).
// Extend this list as later-phase modules land — never hardcode a role
// check in business logic, always check a permission key.
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ROLE_PERMISSIONS = exports.STAFF_ROLES = exports.SALES_DASHBOARD_DEFAULT_ROLES = exports.PERMISSION_IMPLIES = exports.PERMISSIONS = void 0;
exports.permissionSatisfied = permissionSatisfied;
exports.PERMISSIONS = [
    { key: "sales.view", label: "View Sales", category: "Sales" },
    { key: "dashboard.sales.view", label: "View Dashboard Revenue & Sales Reports", category: "Sales" },
    { key: "orders.create", label: "Create Orders", category: "Orders" },
    { key: "orders.edit", label: "Edit Orders", category: "Orders" },
    { key: "orders.cancel", label: "Cancel Orders", category: "Orders" },
    { key: "orders.accept", label: "Accept / Decline Incoming Orders", category: "Orders" },
    { key: "discounts.apply", label: "Apply Discounts", category: "Orders" },
    { key: "refunds.process", label: "Process Refunds", category: "Orders" },
    { key: "orders.delete", label: "Delete Past Transactions (admin password)", category: "Orders" },
    { key: "bills.print", label: "Print Bills", category: "Orders" },
    { key: "tables.view", label: "View Floors & Tables (read-only)", category: "Tables" },
    { key: "tables.manage", label: "Manage Tables", category: "Tables" },
    { key: "menu.view", label: "View Menu (read-only)", category: "Menu" },
    { key: "menu.manage", label: "Manage Menu", category: "Menu" },
    { key: "inventory.manage", label: "Manage Inventory", category: "Inventory" },
    { key: "reports.access", label: "Access Reports", category: "Reports" },
    { key: "users.manage", label: "Manage Users", category: "Admin" },
    { key: "reports.financial.view", label: "View Financial Reports", category: "Reports" },
    { key: "data.export", label: "Export Data", category: "Reports" },
    { key: "kds.manage", label: "Manage Kitchen Display", category: "Kitchen" },
    { key: "reservations.manage", label: "Manage Reservations", category: "Reservations" },
    { key: "settings.manage", label: "Manage Settings", category: "Admin" },
    { key: "customers.manage", label: "Manage Customers & Loyalty", category: "CRM" },
    { key: "audit_log.view", label: "View Audit Log", category: "Admin" },
    { key: "roles.manage", label: "Manage Roles", category: "Admin" },
    { key: "backup.manage", label: "Manage Backups", category: "Admin" },
    { key: "attendance.manage", label: "Manage Staff Attendance", category: "Staff" },
    { key: "delivery.manage", label: "Manage Deliveries", category: "Delivery" },
    { key: "staff.manage", label: "Manage Staff Schedules, Leave & Payroll", category: "Staff" },
    { key: "accounting.manage", label: "Manage Accounting", category: "Accounting" },
    { key: "marketing.manage", label: "Manage Coupons, Promotions & Campaigns", category: "Marketing" },
    { key: "operations.manage", label: "Manage Equipment & Documents", category: "Operations" },
    { key: "system.update", label: "Manage App Updates", category: "Admin" },
];
// A "manage" permission always includes its read-only counterpart, so roles
// that predate the *.view keys (and custom roles) keep working unchanged.
exports.PERMISSION_IMPLIES = {
    "menu.manage": ["menu.view"],
    "tables.manage": ["tables.view"],
};
/** True when `held` satisfies `required`, directly or through PERMISSION_IMPLIES. */
function permissionSatisfied(held, required) {
    if (held.includes(required))
        return true;
    return Object.entries(exports.PERMISSION_IMPLIES).some(([owner, implied]) => held.includes(owner) && implied.includes(required));
}
// Dashboard revenue/trends and the sales-total reports. Deliberately NOT
// implied by sales.view (RESTAURANT_MANAGER holds that one).
exports.SALES_DASHBOARD_DEFAULT_ROLES = [
    "OWNER", "ADMINISTRATOR", "ACCOUNTANT", "CASHIER",
];
exports.STAFF_ROLES = [
    "OWNER",
    "ADMINISTRATOR",
    "RESTAURANT_MANAGER",
    "CASHIER",
    "WAITER",
    "KITCHEN_STAFF",
    "CHEF",
    "BARTENDER",
    "DELIVERY_STAFF",
    "ACCOUNTANT",
    "INVENTORY_MANAGER",
];
// Default permission bundles per role — seeded on first boot, but every
// permission remains individually toggleable afterward (stored per-role in
// the DB, this is just the initial grant set).
exports.DEFAULT_ROLE_PERMISSIONS = {
    OWNER: exports.PERMISSIONS.map((p) => p.key),
    ADMINISTRATOR: exports.PERMISSIONS.map((p) => p.key),
    RESTAURANT_MANAGER: [
        "sales.view", "orders.create", "orders.edit", "orders.cancel", "orders.accept",
        "discounts.apply", "bills.print", "tables.manage", "tables.view", "menu.manage", "menu.view",
        "inventory.manage", "reports.access", "kds.manage",
        "reservations.manage", "customers.manage", "refunds.process",
        "attendance.manage", "delivery.manage", "staff.manage", "accounting.manage", "marketing.manage", "operations.manage",
    ],
    CASHIER: [
        "orders.create", "orders.edit", "orders.accept", "bills.print", "discounts.apply",
        "sales.view", "customers.manage", "dashboard.sales.view",
        "menu.view", "tables.view",
    ],
    // Waiters read the menu and floor plan and run orders; they cannot edit
    // either, and have no revenue access.
    WAITER: ["orders.create", "orders.edit", "orders.accept", "tables.view", "menu.view", "bills.print"],
    KITCHEN_STAFF: ["kds.manage", "orders.accept"],
    CHEF: ["kds.manage", "orders.accept", "menu.manage", "menu.view"],
    BARTENDER: ["orders.create", "orders.accept", "kds.manage", "menu.view", "tables.view"],
    DELIVERY_STAFF: ["orders.edit", "delivery.manage"],
    ACCOUNTANT: ["sales.view", "dashboard.sales.view", "reports.access", "reports.financial.view", "data.export", "accounting.manage"],
    INVENTORY_MANAGER: ["inventory.manage", "reports.access"],
};
