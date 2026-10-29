import { type PurchaseOrderStatus, type PurchaseRequestStatus, type QuotationStatus, type SessionUser } from '@nodedr-restaurant/types';
import { BranchAccessService } from '../../common/services/branch-access.service';
import { GoodsReceiptsService } from './goods-receipts.service';
import { InventoryService } from './inventory.service';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseRequestsService } from './purchase-requests.service';
import { StockService } from './stock.service';
import { SupplierInvoicesService } from './supplier-invoices.service';
import { SupplierQuotationsService } from './supplier-quotations.service';
import { WasteService } from './waste.service';
export declare class InventoryController {
    private readonly inventoryService;
    private readonly purchaseOrdersService;
    private readonly goodsReceiptsService;
    private readonly wasteService;
    private readonly stockService;
    private readonly purchaseRequestsService;
    private readonly supplierQuotationsService;
    private readonly supplierInvoicesService;
    private readonly branchAccess;
    constructor(inventoryService: InventoryService, purchaseOrdersService: PurchaseOrdersService, goodsReceiptsService: GoodsReceiptsService, wasteService: WasteService, stockService: StockService, purchaseRequestsService: PurchaseRequestsService, supplierQuotationsService: SupplierQuotationsService, supplierInvoicesService: SupplierInvoicesService, branchAccess: BranchAccessService);
    listIngredients(user: SessionUser, branchId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        branchId: string;
        sku: string | null;
        unit: import("@prisma/client").$Enums.IngredientUnit;
        reorderLevel: import("@prisma/client/runtime/library").Decimal;
        currentStock: import("@prisma/client/runtime/library").Decimal;
        costPerUnit: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    lowStockIngredients(user: SessionUser, branchId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        branchId: string;
        sku: string | null;
        unit: import("@prisma/client").$Enums.IngredientUnit;
        reorderLevel: import("@prisma/client/runtime/library").Decimal;
        currentStock: import("@prisma/client/runtime/library").Decimal;
        costPerUnit: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    getIngredient(user: SessionUser, branchId: string, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        branchId: string;
        sku: string | null;
        unit: import("@prisma/client").$Enums.IngredientUnit;
        reorderLevel: import("@prisma/client/runtime/library").Decimal;
        currentStock: import("@prisma/client/runtime/library").Decimal;
        costPerUnit: import("@prisma/client/runtime/library").Decimal;
    }>;
    createIngredient(user: SessionUser, branchId: string, body: unknown): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        branchId: string;
        sku: string | null;
        unit: import("@prisma/client").$Enums.IngredientUnit;
        reorderLevel: import("@prisma/client/runtime/library").Decimal;
        currentStock: import("@prisma/client/runtime/library").Decimal;
        costPerUnit: import("@prisma/client/runtime/library").Decimal;
    }>;
    updateIngredient(user: SessionUser, branchId: string, id: string, body: unknown): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        branchId: string;
        sku: string | null;
        unit: import("@prisma/client").$Enums.IngredientUnit;
        reorderLevel: import("@prisma/client/runtime/library").Decimal;
        currentStock: import("@prisma/client/runtime/library").Decimal;
        costPerUnit: import("@prisma/client/runtime/library").Decimal;
    }>;
    deleteIngredient(user: SessionUser, branchId: string, id: string): Promise<{
        ok: boolean;
    }>;
    adjustStock(user: SessionUser, branchId: string, id: string, body: unknown): Promise<{
        id: string;
        createdAt: Date;
        branchId: string;
        type: import("@prisma/client").$Enums.StockMovementType;
        createdById: string;
        orderId: string | null;
        quantity: import("@prisma/client/runtime/library").Decimal;
        note: string | null;
        ingredientId: string;
        batchId: string | null;
    }>;
    listMovements(user: SessionUser, branchId: string, id: string): Promise<({
        createdBy: {
            id: string;
            name: string;
        };
        batch: {
            id: string;
            branchId: string;
            ingredientId: string;
            receivedAt: Date;
            unitCost: import("@prisma/client/runtime/library").Decimal;
            quantityReceived: import("@prisma/client/runtime/library").Decimal;
            batchNumber: string;
            expiryDate: Date | null;
            quantityRemaining: import("@prisma/client/runtime/library").Decimal;
            goodsReceiptItemId: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        branchId: string;
        type: import("@prisma/client").$Enums.StockMovementType;
        createdById: string;
        orderId: string | null;
        quantity: import("@prisma/client/runtime/library").Decimal;
        note: string | null;
        ingredientId: string;
        batchId: string | null;
    })[]>;
    listBatches(user: SessionUser, branchId: string, id: string): Promise<{
        id: string;
        branchId: string;
        ingredientId: string;
        receivedAt: Date;
        unitCost: import("@prisma/client/runtime/library").Decimal;
        quantityReceived: import("@prisma/client/runtime/library").Decimal;
        batchNumber: string;
        expiryDate: Date | null;
        quantityRemaining: import("@prisma/client/runtime/library").Decimal;
        goodsReceiptItemId: string | null;
    }[]>;
    getRecipe(user: SessionUser, branchId: string, id: string): Promise<{
        lines: {
            id: string;
            ingredientId: string;
            ingredientName: string;
            unit: import("@prisma/client").$Enums.IngredientUnit;
            quantity: number;
            costPerUnit: number;
            lineCost: number;
        }[];
        totalCost: number;
    }>;
    setRecipe(user: SessionUser, branchId: string, id: string, body: unknown): Promise<{
        lines: {
            id: string;
            ingredientId: string;
            ingredientName: string;
            unit: import("@prisma/client").$Enums.IngredientUnit;
            quantity: number;
            costPerUnit: number;
            lineCost: number;
        }[];
        totalCost: number;
    }>;
    trackingStatus(user: SessionUser, branchId: string): Promise<{
        tracked: number;
        untracked: number;
        problems: {
            menuItemId: string;
            name: string;
            reason: import("./stock-plan").SkipReason;
        }[];
    }>;
    getTracking(user: SessionUser, branchId: string, id: string): Promise<{
        stockQuantityPerSale: number;
        id: string;
        isCombo: boolean;
        inventoryTracking: import("@prisma/client").$Enums.InventoryTracking;
        stockIngredientId: string | null;
    }>;
    setTracking(user: SessionUser, branchId: string, id: string, body: unknown): Promise<{
        stockQuantityPerSale: number;
        id: string;
        isCombo: boolean;
        inventoryTracking: import("@prisma/client").$Enums.InventoryTracking;
        stockIngredientId: string | null;
    }>;
    listSuppliers(user: SessionUser, branchId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
        phone: string | null;
        gstNumber: string | null;
        isActive: boolean;
        email: string | null;
        branchId: string;
        notes: string | null;
        contactName: string | null;
    }[]>;
    getSupplier(user: SessionUser, branchId: string, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
        phone: string | null;
        gstNumber: string | null;
        isActive: boolean;
        email: string | null;
        branchId: string;
        notes: string | null;
        contactName: string | null;
    }>;
    createSupplier(user: SessionUser, branchId: string, body: unknown): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
        phone: string | null;
        gstNumber: string | null;
        isActive: boolean;
        email: string | null;
        branchId: string;
        notes: string | null;
        contactName: string | null;
    }>;
    updateSupplier(user: SessionUser, branchId: string, id: string, body: unknown): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
        phone: string | null;
        gstNumber: string | null;
        isActive: boolean;
        email: string | null;
        branchId: string;
        notes: string | null;
        contactName: string | null;
    }>;
    deleteSupplier(user: SessionUser, branchId: string, id: string): Promise<{
        ok: boolean;
    }>;
    listPurchaseOrders(user: SessionUser, branchId: string, status?: PurchaseOrderStatus): Promise<({
        items: {
            id: string;
            purchaseOrderId: string;
            ingredientId: string;
            quantityOrdered: import("@prisma/client/runtime/library").Decimal;
            unitCost: import("@prisma/client/runtime/library").Decimal;
            quantityReceived: import("@prisma/client/runtime/library").Decimal;
        }[];
        createdBy: {
            id: string;
            name: string;
        };
        supplier: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.PurchaseOrderStatus;
        notes: string | null;
        createdById: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        supplierId: string;
        poNumber: string;
        expectedDate: Date | null;
    })[]>;
    getPurchaseOrder(user: SessionUser, branchId: string, id: string): Promise<{
        goodsReceipts: ({
            items: {
                id: string;
                createdAt: Date;
                quantity: import("@prisma/client/runtime/library").Decimal;
                goodsReceiptId: string;
                ingredientId: string;
                unitCost: import("@prisma/client/runtime/library").Decimal;
                purchaseOrderItemId: string | null;
                batchNumber: string;
                expiryDate: Date | null;
            }[];
            receivedBy: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            branchId: string;
            notes: string | null;
            supplierId: string;
            purchaseOrderId: string | null;
            grnNumber: string;
            receivedById: string;
            receivedAt: Date;
        })[];
        items: ({
            ingredient: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                branchId: string;
                sku: string | null;
                unit: import("@prisma/client").$Enums.IngredientUnit;
                reorderLevel: import("@prisma/client/runtime/library").Decimal;
                currentStock: import("@prisma/client/runtime/library").Decimal;
                costPerUnit: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: string;
            purchaseOrderId: string;
            ingredientId: string;
            quantityOrdered: import("@prisma/client/runtime/library").Decimal;
            unitCost: import("@prisma/client/runtime/library").Decimal;
            quantityReceived: import("@prisma/client/runtime/library").Decimal;
        })[];
        createdBy: {
            id: string;
            name: string;
        };
        supplier: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            phone: string | null;
            gstNumber: string | null;
            isActive: boolean;
            email: string | null;
            branchId: string;
            notes: string | null;
            contactName: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.PurchaseOrderStatus;
        notes: string | null;
        createdById: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        supplierId: string;
        poNumber: string;
        expectedDate: Date | null;
    }>;
    createPurchaseOrder(user: SessionUser, branchId: string, body: unknown): Promise<{
        items: {
            id: string;
            purchaseOrderId: string;
            ingredientId: string;
            quantityOrdered: import("@prisma/client/runtime/library").Decimal;
            unitCost: import("@prisma/client/runtime/library").Decimal;
            quantityReceived: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.PurchaseOrderStatus;
        notes: string | null;
        createdById: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        supplierId: string;
        poNumber: string;
        expectedDate: Date | null;
    }>;
    updatePurchaseOrderStatus(user: SessionUser, branchId: string, id: string, body: {
        status: PurchaseOrderStatus;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.PurchaseOrderStatus;
        notes: string | null;
        createdById: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        supplierId: string;
        poNumber: string;
        expectedDate: Date | null;
    }>;
    listGoodsReceipts(user: SessionUser, branchId: string): Promise<({
        items: {
            id: string;
            createdAt: Date;
            quantity: import("@prisma/client/runtime/library").Decimal;
            goodsReceiptId: string;
            ingredientId: string;
            unitCost: import("@prisma/client/runtime/library").Decimal;
            purchaseOrderItemId: string | null;
            batchNumber: string;
            expiryDate: Date | null;
        }[];
        supplier: {
            id: string;
            name: string;
        };
        receivedBy: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        branchId: string;
        notes: string | null;
        supplierId: string;
        purchaseOrderId: string | null;
        grnNumber: string;
        receivedById: string;
        receivedAt: Date;
    })[]>;
    getGoodsReceipt(user: SessionUser, branchId: string, id: string): Promise<{
        items: ({
            ingredient: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                branchId: string;
                sku: string | null;
                unit: import("@prisma/client").$Enums.IngredientUnit;
                reorderLevel: import("@prisma/client/runtime/library").Decimal;
                currentStock: import("@prisma/client/runtime/library").Decimal;
                costPerUnit: import("@prisma/client/runtime/library").Decimal;
            };
            stockBatch: {
                id: string;
                branchId: string;
                ingredientId: string;
                receivedAt: Date;
                unitCost: import("@prisma/client/runtime/library").Decimal;
                quantityReceived: import("@prisma/client/runtime/library").Decimal;
                batchNumber: string;
                expiryDate: Date | null;
                quantityRemaining: import("@prisma/client/runtime/library").Decimal;
                goodsReceiptItemId: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            quantity: import("@prisma/client/runtime/library").Decimal;
            goodsReceiptId: string;
            ingredientId: string;
            unitCost: import("@prisma/client/runtime/library").Decimal;
            purchaseOrderItemId: string | null;
            batchNumber: string;
            expiryDate: Date | null;
        })[];
        supplier: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            phone: string | null;
            gstNumber: string | null;
            isActive: boolean;
            email: string | null;
            branchId: string;
            notes: string | null;
            contactName: string | null;
        };
        purchaseOrder: {
            id: string;
            poNumber: string;
        } | null;
        receivedBy: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        branchId: string;
        notes: string | null;
        supplierId: string;
        purchaseOrderId: string | null;
        grnNumber: string;
        receivedById: string;
        receivedAt: Date;
    }>;
    createGoodsReceipt(user: SessionUser, branchId: string, body: unknown): Promise<{
        items: ({
            ingredient: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                branchId: string;
                sku: string | null;
                unit: import("@prisma/client").$Enums.IngredientUnit;
                reorderLevel: import("@prisma/client/runtime/library").Decimal;
                currentStock: import("@prisma/client/runtime/library").Decimal;
                costPerUnit: import("@prisma/client/runtime/library").Decimal;
            };
            stockBatch: {
                id: string;
                branchId: string;
                ingredientId: string;
                receivedAt: Date;
                unitCost: import("@prisma/client/runtime/library").Decimal;
                quantityReceived: import("@prisma/client/runtime/library").Decimal;
                batchNumber: string;
                expiryDate: Date | null;
                quantityRemaining: import("@prisma/client/runtime/library").Decimal;
                goodsReceiptItemId: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            quantity: import("@prisma/client/runtime/library").Decimal;
            goodsReceiptId: string;
            ingredientId: string;
            unitCost: import("@prisma/client/runtime/library").Decimal;
            purchaseOrderItemId: string | null;
            batchNumber: string;
            expiryDate: Date | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        branchId: string;
        notes: string | null;
        supplierId: string;
        purchaseOrderId: string | null;
        grnNumber: string;
        receivedById: string;
        receivedAt: Date;
    }>;
    listWasteLogs(user: SessionUser, branchId: string): Promise<({
        createdBy: {
            id: string;
            name: string;
        };
        ingredient: {
            id: string;
            name: string;
            unit: import("@prisma/client").$Enums.IngredientUnit;
        };
    } & {
        id: string;
        createdAt: Date;
        branchId: string;
        notes: string | null;
        createdById: string;
        quantity: import("@prisma/client/runtime/library").Decimal;
        reason: import("@prisma/client").$Enums.WasteReason;
        ingredientId: string;
        batchId: string | null;
        unitCostAtWaste: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    logWaste(user: SessionUser, branchId: string, body: unknown): Promise<{
        id: string;
        createdAt: Date;
        branchId: string;
        notes: string | null;
        createdById: string;
        quantity: import("@prisma/client/runtime/library").Decimal;
        reason: import("@prisma/client").$Enums.WasteReason;
        ingredientId: string;
        batchId: string | null;
        unitCostAtWaste: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    listPurchaseRequests(user: SessionUser, branchId: string, status?: PurchaseRequestStatus): Promise<({
        items: ({
            ingredient: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                branchId: string;
                sku: string | null;
                unit: import("@prisma/client").$Enums.IngredientUnit;
                reorderLevel: import("@prisma/client/runtime/library").Decimal;
                currentStock: import("@prisma/client/runtime/library").Decimal;
                costPerUnit: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: string;
            notes: string | null;
            ingredientId: string;
            quantityRequested: import("@prisma/client/runtime/library").Decimal;
            purchaseRequestId: string;
        })[];
        requestedBy: {
            id: string;
            name: string;
        };
        approvedBy: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.PurchaseRequestStatus;
        notes: string | null;
        requestNumber: string;
        requestedById: string;
        approvedById: string | null;
    })[]>;
    getPurchaseRequest(user: SessionUser, branchId: string, id: string): Promise<{
        items: ({
            ingredient: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                branchId: string;
                sku: string | null;
                unit: import("@prisma/client").$Enums.IngredientUnit;
                reorderLevel: import("@prisma/client/runtime/library").Decimal;
                currentStock: import("@prisma/client/runtime/library").Decimal;
                costPerUnit: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: string;
            notes: string | null;
            ingredientId: string;
            quantityRequested: import("@prisma/client/runtime/library").Decimal;
            purchaseRequestId: string;
        })[];
        requestedBy: {
            id: string;
            name: string;
        };
        approvedBy: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.PurchaseRequestStatus;
        notes: string | null;
        requestNumber: string;
        requestedById: string;
        approvedById: string | null;
    }>;
    createPurchaseRequest(user: SessionUser, branchId: string, body: unknown): Promise<{
        items: {
            id: string;
            notes: string | null;
            ingredientId: string;
            quantityRequested: import("@prisma/client/runtime/library").Decimal;
            purchaseRequestId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.PurchaseRequestStatus;
        notes: string | null;
        requestNumber: string;
        requestedById: string;
        approvedById: string | null;
    }>;
    updatePurchaseRequestStatus(user: SessionUser, branchId: string, id: string, body: {
        status: PurchaseRequestStatus;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.PurchaseRequestStatus;
        notes: string | null;
        requestNumber: string;
        requestedById: string;
        approvedById: string | null;
    }>;
    listQuotations(user: SessionUser, branchId: string, ingredientId?: string): Promise<({
        items: ({
            ingredient: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                branchId: string;
                sku: string | null;
                unit: import("@prisma/client").$Enums.IngredientUnit;
                reorderLevel: import("@prisma/client/runtime/library").Decimal;
                currentStock: import("@prisma/client/runtime/library").Decimal;
                costPerUnit: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: string;
            ingredientId: string;
            supplierQuotationId: string;
            quantityQuoted: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        })[];
        supplier: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.QuotationStatus;
        notes: string | null;
        createdById: string;
        supplierId: string;
        validUntil: Date | null;
        quotationNumber: string;
    })[]>;
    compareQuotations(user: SessionUser, branchId: string, ingredientId: string): Promise<{
        supplierId: string;
        supplierName: string;
        quotationId: string;
        quotationNumber: string;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
        quantityQuoted: import("@prisma/client/runtime/library").Decimal;
        validUntil: Date | null;
    }[]>;
    getQuotation(user: SessionUser, branchId: string, id: string): Promise<{
        items: ({
            ingredient: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                branchId: string;
                sku: string | null;
                unit: import("@prisma/client").$Enums.IngredientUnit;
                reorderLevel: import("@prisma/client/runtime/library").Decimal;
                currentStock: import("@prisma/client/runtime/library").Decimal;
                costPerUnit: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: string;
            ingredientId: string;
            supplierQuotationId: string;
            quantityQuoted: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        })[];
        createdBy: {
            id: string;
            name: string;
        };
        supplier: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            phone: string | null;
            gstNumber: string | null;
            isActive: boolean;
            email: string | null;
            branchId: string;
            notes: string | null;
            contactName: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.QuotationStatus;
        notes: string | null;
        createdById: string;
        supplierId: string;
        validUntil: Date | null;
        quotationNumber: string;
    }>;
    createQuotation(user: SessionUser, branchId: string, body: unknown): Promise<{
        items: {
            id: string;
            ingredientId: string;
            supplierQuotationId: string;
            quantityQuoted: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.QuotationStatus;
        notes: string | null;
        createdById: string;
        supplierId: string;
        validUntil: Date | null;
        quotationNumber: string;
    }>;
    updateQuotationStatus(user: SessionUser, branchId: string, id: string, body: {
        status: QuotationStatus;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.QuotationStatus;
        notes: string | null;
        createdById: string;
        supplierId: string;
        validUntil: Date | null;
        quotationNumber: string;
    }>;
    listSupplierInvoices(user: SessionUser, branchId: string, supplierId?: string): Promise<({
        payments: {
            id: string;
            createdAt: Date;
            branchId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            recordedById: string;
            paidAt: Date;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
            supplierInvoiceId: string;
        }[];
        supplier: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.SupplierInvoiceStatus;
        notes: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        supplierId: string;
        purchaseOrderId: string | null;
        goodsReceiptId: string | null;
        invoiceNumber: string;
        invoiceDate: Date;
        dueDate: Date | null;
        amountPaid: import("@prisma/client/runtime/library").Decimal;
        recordedById: string;
    })[]>;
    getSupplierInvoice(user: SessionUser, branchId: string, id: string): Promise<{
        payments: ({
            recordedBy: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            branchId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            recordedById: string;
            paidAt: Date;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
            supplierInvoiceId: string;
        })[];
        supplier: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            phone: string | null;
            gstNumber: string | null;
            isActive: boolean;
            email: string | null;
            branchId: string;
            notes: string | null;
            contactName: string | null;
        };
        purchaseOrder: {
            id: string;
            poNumber: string;
        } | null;
        goodsReceipt: {
            id: string;
            grnNumber: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.SupplierInvoiceStatus;
        notes: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        supplierId: string;
        purchaseOrderId: string | null;
        goodsReceiptId: string | null;
        invoiceNumber: string;
        invoiceDate: Date;
        dueDate: Date | null;
        amountPaid: import("@prisma/client/runtime/library").Decimal;
        recordedById: string;
    }>;
    createSupplierInvoice(user: SessionUser, branchId: string, body: unknown): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.SupplierInvoiceStatus;
        notes: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        supplierId: string;
        purchaseOrderId: string | null;
        goodsReceiptId: string | null;
        invoiceNumber: string;
        invoiceDate: Date;
        dueDate: Date | null;
        amountPaid: import("@prisma/client/runtime/library").Decimal;
        recordedById: string;
    }>;
    recordSupplierPayment(user: SessionUser, branchId: string, id: string, body: unknown): Promise<{
        id: string;
        createdAt: Date;
        branchId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        reference: string | null;
        recordedById: string;
        paidAt: Date;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        supplierInvoiceId: string;
    }>;
    cancelSupplierInvoice(user: SessionUser, branchId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        status: import("@prisma/client").$Enums.SupplierInvoiceStatus;
        notes: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        supplierId: string;
        purchaseOrderId: string | null;
        goodsReceiptId: string | null;
        invoiceNumber: string;
        invoiceDate: Date;
        dueDate: Date | null;
        amountPaid: import("@prisma/client/runtime/library").Decimal;
        recordedById: string;
    }>;
    getSupplierPerformance(user: SessionUser, branchId: string, id: string): Promise<{
        supplierId: string;
        supplierName: string;
        totalPurchaseOrders: number;
        totalSpend: number;
        onTimeDeliveryRate: number | null;
        avgLeadTimeDays: number | null;
    }>;
}
