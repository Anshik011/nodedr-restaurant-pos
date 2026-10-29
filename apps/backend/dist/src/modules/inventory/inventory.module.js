"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryModule = void 0;
const common_1 = require("@nestjs/common");
const audit_module_1 = require("../../audit/audit.module");
const branch_access_service_1 = require("../../common/services/branch-access.service");
const goods_receipts_service_1 = require("./goods-receipts.service");
const inventory_controller_1 = require("./inventory.controller");
const inventory_service_1 = require("./inventory.service");
const purchase_orders_service_1 = require("./purchase-orders.service");
const purchase_requests_service_1 = require("./purchase-requests.service");
const stock_service_1 = require("./stock.service");
const supplier_invoices_service_1 = require("./supplier-invoices.service");
const supplier_quotations_service_1 = require("./supplier-quotations.service");
const transfers_controller_1 = require("./transfers.controller");
const transfers_service_1 = require("./transfers.service");
const waste_service_1 = require("./waste.service");
let InventoryModule = class InventoryModule {
};
exports.InventoryModule = InventoryModule;
exports.InventoryModule = InventoryModule = __decorate([
    (0, common_1.Module)({
        imports: [audit_module_1.AuditModule],
        controllers: [inventory_controller_1.InventoryController, transfers_controller_1.TransfersController],
        providers: [
            inventory_service_1.InventoryService,
            purchase_orders_service_1.PurchaseOrdersService,
            goods_receipts_service_1.GoodsReceiptsService,
            waste_service_1.WasteService,
            stock_service_1.StockService,
            transfers_service_1.TransfersService,
            purchase_requests_service_1.PurchaseRequestsService,
            supplier_quotations_service_1.SupplierQuotationsService,
            supplier_invoices_service_1.SupplierInvoicesService,
            branch_access_service_1.BranchAccessService,
        ],
        exports: [inventory_service_1.InventoryService],
    })
], InventoryModule);
//# sourceMappingURL=inventory.module.js.map