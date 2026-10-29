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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierInvoicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const money_1 = require("../../common/money");
let SupplierInvoicesService = class SupplierInvoicesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    listInvoices(branchId, supplierId) {
        return this.prisma.supplierInvoice.findMany({
            where: { branchId, ...(supplierId ? { supplierId } : {}) },
            include: {
                supplier: { select: { id: true, name: true } },
                payments: true,
            },
            orderBy: { invoiceDate: 'desc' },
        });
    }
    async getInvoice(branchId, id) {
        const invoice = await this.prisma.supplierInvoice.findFirst({
            where: { id, branchId },
            include: {
                supplier: true,
                purchaseOrder: { select: { id: true, poNumber: true } },
                goodsReceipt: { select: { id: true, grnNumber: true } },
                payments: {
                    include: { recordedBy: { select: { id: true, name: true } } },
                    orderBy: { paidAt: 'desc' },
                },
            },
        });
        if (!invoice)
            throw new common_1.NotFoundException('Supplier invoice not found');
        return invoice;
    }
    async createInvoice(branchId, userId, dto) {
        const supplier = await this.prisma.supplier.findFirst({
            where: { id: dto.supplierId, branchId },
        });
        if (!supplier)
            throw new common_1.BadRequestException('Supplier not found in this branch');
        if (dto.purchaseOrderId) {
            const po = await this.prisma.purchaseOrder.findFirst({
                where: { id: dto.purchaseOrderId, branchId },
            });
            if (!po)
                throw new common_1.BadRequestException('Purchase order not found in this branch');
        }
        if (dto.goodsReceiptId) {
            const grn = await this.prisma.goodsReceipt.findFirst({
                where: { id: dto.goodsReceiptId, branchId },
            });
            if (!grn)
                throw new common_1.BadRequestException('Goods receipt not found in this branch');
        }
        return this.prisma.supplierInvoice.create({
            data: {
                branchId,
                supplierId: dto.supplierId,
                purchaseOrderId: dto.purchaseOrderId,
                goodsReceiptId: dto.goodsReceiptId,
                invoiceNumber: dto.invoiceNumber,
                invoiceDate: dto.invoiceDate,
                dueDate: dto.dueDate,
                totalAmount: (0, money_1.round2)(dto.totalAmount),
                recordedById: userId,
            },
        });
    }
    async recordPayment(branchId, invoiceId, userId, dto) {
        return this.prisma.$transaction(async (tx) => {
            const invoice = await tx.supplierInvoice.findFirst({
                where: { id: invoiceId, branchId },
            });
            if (!invoice)
                throw new common_1.NotFoundException('Supplier invoice not found');
            if (invoice.status === 'CANCELLED') {
                throw new common_1.BadRequestException('Cannot pay a cancelled invoice');
            }
            const currentPaid = Number(invoice.amountPaid);
            const total = Number(invoice.totalAmount);
            const remaining = (0, money_1.round2)(total - currentPaid);
            if (dto.amount > remaining) {
                throw new common_1.BadRequestException(`Payment of ${dto.amount} exceeds the remaining balance of ${remaining}`);
            }
            const newPaid = (0, money_1.round2)(currentPaid + dto.amount);
            const newStatus = newPaid >= total ? 'PAID' : newPaid > 0 ? 'PARTIALLY_PAID' : 'UNPAID';
            const payment = await tx.supplierPayment.create({
                data: {
                    branchId,
                    supplierInvoiceId: invoiceId,
                    amount: dto.amount,
                    paymentMethod: dto.paymentMethod,
                    reference: dto.reference,
                    recordedById: userId,
                },
            });
            await tx.supplierInvoice.update({
                where: { id: invoiceId },
                data: { amountPaid: newPaid, status: newStatus },
            });
            return payment;
        });
    }
    async cancelInvoice(branchId, id) {
        const invoice = await this.getInvoice(branchId, id);
        if (Number(invoice.amountPaid) > 0) {
            throw new common_1.BadRequestException('Cannot cancel an invoice that already has payments recorded');
        }
        return this.prisma.supplierInvoice.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });
    }
    async getSupplierPerformance(branchId, supplierId) {
        const supplier = await this.prisma.supplier.findFirst({
            where: { id: supplierId, branchId },
        });
        if (!supplier)
            throw new common_1.NotFoundException('Supplier not found');
        const orders = await this.prisma.purchaseOrder.findMany({
            where: { branchId, supplierId, status: { not: 'CANCELLED' } },
            select: {
                id: true,
                expectedDate: true,
                createdAt: true,
                totalAmount: true,
            },
        });
        const receipts = await this.prisma.goodsReceipt.findMany({
            where: { branchId, supplierId, purchaseOrderId: { not: null } },
            select: { purchaseOrderId: true, receivedAt: true },
        });
        const firstReceiptByPo = new Map();
        for (const r of receipts) {
            if (!r.purchaseOrderId)
                continue;
            const existing = firstReceiptByPo.get(r.purchaseOrderId);
            if (!existing || r.receivedAt < existing) {
                firstReceiptByPo.set(r.purchaseOrderId, r.receivedAt);
            }
        }
        let onTimeCount = 0;
        let lateCount = 0;
        let leadTimeDaysSum = 0;
        let leadTimeSamples = 0;
        for (const po of orders) {
            const receivedAt = firstReceiptByPo.get(po.id);
            if (!receivedAt)
                continue;
            leadTimeDaysSum +=
                (receivedAt.getTime() - po.createdAt.getTime()) / (1000 * 60 * 60 * 24);
            leadTimeSamples += 1;
            if (po.expectedDate) {
                if (receivedAt <= po.expectedDate)
                    onTimeCount += 1;
                else
                    lateCount += 1;
            }
        }
        const invoices = await this.prisma.supplierInvoice.findMany({
            where: { branchId, supplierId, status: { not: 'CANCELLED' } },
            select: { totalAmount: true },
        });
        const totalSpend = (0, money_1.round2)(invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0));
        const trackedDeliveries = onTimeCount + lateCount;
        return {
            supplierId,
            supplierName: supplier.name,
            totalPurchaseOrders: orders.length,
            totalSpend,
            onTimeDeliveryRate: trackedDeliveries > 0
                ? (0, money_1.round2)((onTimeCount / trackedDeliveries) * 100)
                : null,
            avgLeadTimeDays: leadTimeSamples > 0 ? (0, money_1.round2)(leadTimeDaysSum / leadTimeSamples) : null,
        };
    }
};
exports.SupplierInvoicesService = SupplierInvoicesService;
exports.SupplierInvoicesService = SupplierInvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SupplierInvoicesService);
//# sourceMappingURL=supplier-invoices.service.js.map