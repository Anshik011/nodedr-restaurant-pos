import type { SupplierInvoiceDto, SupplierPaymentDto } from '@nodedr-restaurant/types';
import { PrismaService } from '../../prisma/prisma.service';
export declare class SupplierInvoicesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listInvoices(branchId: string, supplierId?: string): import("@prisma/client").Prisma.PrismaPromise<({
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
    getInvoice(branchId: string, id: string): Promise<{
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
    createInvoice(branchId: string, userId: string, dto: SupplierInvoiceDto): Promise<{
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
    recordPayment(branchId: string, invoiceId: string, userId: string, dto: SupplierPaymentDto): Promise<{
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
    cancelInvoice(branchId: string, id: string): Promise<{
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
    getSupplierPerformance(branchId: string, supplierId: string): Promise<{
        supplierId: string;
        supplierName: string;
        totalPurchaseOrders: number;
        totalSpend: number;
        onTimeDeliveryRate: number | null;
        avgLeadTimeDays: number | null;
    }>;
}
