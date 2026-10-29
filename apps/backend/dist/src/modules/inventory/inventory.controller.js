"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const types_1 = require("@nodedr-restaurant/types");
const auth_decorator_1 = require("../../common/decorators/auth.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const branch_access_service_1 = require("../../common/services/branch-access.service");
const goods_receipts_service_1 = require("./goods-receipts.service");
const inventory_service_1 = require("./inventory.service");
const purchase_orders_service_1 = require("./purchase-orders.service");
const purchase_requests_service_1 = require("./purchase-requests.service");
const stock_service_1 = require("./stock.service");
const supplier_invoices_service_1 = require("./supplier-invoices.service");
const supplier_quotations_service_1 = require("./supplier-quotations.service");
const waste_service_1 = require("./waste.service");
let InventoryController = class InventoryController {
    inventoryService;
    purchaseOrdersService;
    goodsReceiptsService;
    wasteService;
    stockService;
    purchaseRequestsService;
    supplierQuotationsService;
    supplierInvoicesService;
    branchAccess;
    constructor(inventoryService, purchaseOrdersService, goodsReceiptsService, wasteService, stockService, purchaseRequestsService, supplierQuotationsService, supplierInvoicesService, branchAccess) {
        this.inventoryService = inventoryService;
        this.purchaseOrdersService = purchaseOrdersService;
        this.goodsReceiptsService = goodsReceiptsService;
        this.wasteService = wasteService;
        this.stockService = stockService;
        this.purchaseRequestsService = purchaseRequestsService;
        this.supplierQuotationsService = supplierQuotationsService;
        this.supplierInvoicesService = supplierInvoicesService;
        this.branchAccess = branchAccess;
    }
    async listIngredients(user, branchId) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.inventoryService.listIngredients(branchId);
    }
    async lowStockIngredients(user, branchId) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.inventoryService.lowStockIngredients(branchId);
    }
    async getIngredient(user, branchId, id) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.inventoryService.getIngredient(branchId, id);
    }
    async createIngredient(user, branchId, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.inventoryService.createIngredient(branchId, body);
    }
    async updateIngredient(user, branchId, id, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.inventoryService.updateIngredient(branchId, id, body);
    }
    async deleteIngredient(user, branchId, id) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.inventoryService.deleteIngredient(branchId, id);
    }
    async adjustStock(user, branchId, id, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.stockService.adjustStock(branchId, user.id, id, body);
    }
    async listMovements(user, branchId, id) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.stockService.listMovements(branchId, id);
    }
    async listBatches(user, branchId, id) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.stockService.listBatches(branchId, id);
    }
    async getRecipe(user, branchId, id) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.inventoryService.getRecipe(branchId, id);
    }
    async setRecipe(user, branchId, id, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        const { lines } = body;
        return this.inventoryService.setRecipe(branchId, id, lines);
    }
    async trackingStatus(user, branchId) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.inventoryService.trackingSetupStatus(branchId);
    }
    async getTracking(user, branchId, id) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.inventoryService.getTracking(branchId, id);
    }
    async setTracking(user, branchId, id, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.inventoryService.setTracking(branchId, id, body);
    }
    async listSuppliers(user, branchId) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.inventoryService.listSuppliers(branchId);
    }
    async getSupplier(user, branchId, id) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.inventoryService.getSupplier(branchId, id);
    }
    async createSupplier(user, branchId, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.inventoryService.createSupplier(branchId, body);
    }
    async updateSupplier(user, branchId, id, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.inventoryService.updateSupplier(branchId, id, body);
    }
    async deleteSupplier(user, branchId, id) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.inventoryService.deleteSupplier(branchId, id);
    }
    async listPurchaseOrders(user, branchId, status) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.purchaseOrdersService.listPurchaseOrders(branchId, status);
    }
    async getPurchaseOrder(user, branchId, id) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.purchaseOrdersService.getPurchaseOrder(branchId, id);
    }
    async createPurchaseOrder(user, branchId, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.purchaseOrdersService.createPurchaseOrder(branchId, user.id, body);
    }
    async updatePurchaseOrderStatus(user, branchId, id, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.purchaseOrdersService.updateStatus(branchId, id, body.status);
    }
    async listGoodsReceipts(user, branchId) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.goodsReceiptsService.listGoodsReceipts(branchId);
    }
    async getGoodsReceipt(user, branchId, id) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.goodsReceiptsService.getGoodsReceipt(branchId, id);
    }
    async createGoodsReceipt(user, branchId, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.goodsReceiptsService.createGoodsReceipt(branchId, user.id, body);
    }
    async listWasteLogs(user, branchId) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.wasteService.listWasteLogs(branchId);
    }
    async logWaste(user, branchId, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.wasteService.logWaste(branchId, user.id, body);
    }
    async listPurchaseRequests(user, branchId, status) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.purchaseRequestsService.listPurchaseRequests(branchId, status);
    }
    async getPurchaseRequest(user, branchId, id) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.purchaseRequestsService.getPurchaseRequest(branchId, id);
    }
    async createPurchaseRequest(user, branchId, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.purchaseRequestsService.createPurchaseRequest(branchId, user.id, body);
    }
    async updatePurchaseRequestStatus(user, branchId, id, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.purchaseRequestsService.updateStatus(branchId, id, user.id, body.status);
    }
    async listQuotations(user, branchId, ingredientId) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.supplierQuotationsService.listQuotations(branchId, ingredientId);
    }
    async compareQuotations(user, branchId, ingredientId) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.supplierQuotationsService.compareForIngredient(branchId, ingredientId);
    }
    async getQuotation(user, branchId, id) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.supplierQuotationsService.getQuotation(branchId, id);
    }
    async createQuotation(user, branchId, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.supplierQuotationsService.createQuotation(branchId, user.id, body);
    }
    async updateQuotationStatus(user, branchId, id, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.supplierQuotationsService.updateStatus(branchId, id, body.status);
    }
    async listSupplierInvoices(user, branchId, supplierId) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.supplierInvoicesService.listInvoices(branchId, supplierId);
    }
    async getSupplierInvoice(user, branchId, id) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.supplierInvoicesService.getInvoice(branchId, id);
    }
    async createSupplierInvoice(user, branchId, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.supplierInvoicesService.createInvoice(branchId, user.id, body);
    }
    async recordSupplierPayment(user, branchId, id, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.supplierInvoicesService.recordPayment(branchId, id, user.id, body);
    }
    async cancelSupplierInvoice(user, branchId, id) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.supplierInvoicesService.cancelInvoice(branchId, id);
    }
    async getSupplierPerformance(user, branchId, id) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.supplierInvoicesService.getSupplierPerformance(branchId, id);
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Get)('ingredients'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "listIngredients", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Get)('ingredients/low-stock'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "lowStockIngredients", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Get)('ingredients/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getIngredient", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Post)('ingredients'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.ingredientSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createIngredient", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Patch)('ingredients/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "updateIngredient", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Delete)('ingredients/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "deleteIngredient", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Post)('ingredients/:id/adjust'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.stockAdjustmentSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "adjustStock", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Get)('ingredients/:id/movements'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "listMovements", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Get)('ingredients/:id/batches'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "listBatches", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Get)('menu-items/:id/recipe'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getRecipe", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Patch)('menu-items/:id/recipe'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.setRecipeSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "setRecipe", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Get)('tracking-status'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "trackingStatus", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Get)('menu-items/:id/tracking'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getTracking", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Patch)('menu-items/:id/tracking'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.menuItemTrackingSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "setTracking", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Get)('suppliers'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "listSuppliers", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Get)('suppliers/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getSupplier", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Post)('suppliers'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.supplierSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createSupplier", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Patch)('suppliers/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "updateSupplier", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Delete)('suppliers/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "deleteSupplier", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Get)('purchase-orders'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "listPurchaseOrders", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Get)('purchase-orders/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getPurchaseOrder", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Post)('purchase-orders'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.purchaseOrderSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createPurchaseOrder", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Patch)('purchase-orders/:id/status'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "updatePurchaseOrderStatus", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Get)('goods-receipts'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "listGoodsReceipts", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Get)('goods-receipts/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getGoodsReceipt", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Post)('goods-receipts'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.goodsReceiptSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createGoodsReceipt", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Get)('waste'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "listWasteLogs", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Post)('waste'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.wasteLogSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "logWaste", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Get)('purchase-requests'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "listPurchaseRequests", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Get)('purchase-requests/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getPurchaseRequest", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Post)('purchase-requests'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.purchaseRequestSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createPurchaseRequest", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Patch)('purchase-requests/:id/status'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "updatePurchaseRequestStatus", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Get)('quotations'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('ingredientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "listQuotations", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Get)('quotations/compare'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('ingredientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "compareQuotations", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Get)('quotations/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getQuotation", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Post)('quotations'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.supplierQuotationSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createQuotation", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Patch)('quotations/:id/status'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "updateQuotationStatus", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Get)('supplier-invoices'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('supplierId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "listSupplierInvoices", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Get)('supplier-invoices/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getSupplierInvoice", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Post)('supplier-invoices'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.supplierInvoiceSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createSupplierInvoice", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Post)('supplier-invoices/:id/payments'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.supplierPaymentSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "recordSupplierPayment", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Patch)('supplier-invoices/:id/cancel'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "cancelSupplierInvoice", null);
__decorate([
    (0, auth_decorator_1.Auth)('inventory.manage'),
    (0, common_1.Get)('suppliers/:id/performance'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getSupplierPerformance", null);
exports.InventoryController = InventoryController = __decorate([
    (0, swagger_1.ApiTags)('inventory'),
    (0, common_1.Controller)('v1/inventory'),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService,
        purchase_orders_service_1.PurchaseOrdersService,
        goods_receipts_service_1.GoodsReceiptsService,
        waste_service_1.WasteService,
        stock_service_1.StockService,
        purchase_requests_service_1.PurchaseRequestsService,
        supplier_quotations_service_1.SupplierQuotationsService,
        supplier_invoices_service_1.SupplierInvoicesService,
        branch_access_service_1.BranchAccessService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map