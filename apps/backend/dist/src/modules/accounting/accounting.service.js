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
exports.AccountingService = void 0;
const common_1 = require("@nestjs/common");
const time_1 = require("../../common/time");
const branch_time_service_1 = require("../../common/services/branch-time.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const accounting_calc_1 = require("./accounting.calc");
const dayStart = (d) => new Date(`${d}T00:00:00.000Z`);
const dayAfter = (d) => new Date(dayStart(d).getTime() + 86_400_000);
let AccountingService = class AccountingService {
    prisma;
    time;
    constructor(prisma, time) {
        this.prisma = prisma;
        this.time = time;
    }
    listExpenses(branchId, from, to) {
        return this.prisma.expense.findMany({
            where: { branchId, spentOn: { gte: dayStart(from), lte: dayStart(to) } },
            orderBy: [{ spentOn: 'desc' }, { createdAt: 'desc' }],
            take: 500,
        });
    }
    createExpense(branchId, userId, dto) {
        return this.prisma.expense.create({
            data: {
                branchId,
                createdById: userId,
                spentOn: dayStart(dto.spentOn),
                category: dto.category,
                amount: dto.amount,
                note: dto.note,
                paidFromCash: dto.paidFromCash,
            },
        });
    }
    async deleteExpense(branchId, id) {
        const expense = await this.prisma.expense.findFirst({
            where: { id, branchId },
        });
        if (!expense)
            throw new common_1.NotFoundException('Expense not found');
        const closed = await this.prisma.cashClosing.findUnique({
            where: {
                branchId_businessDate: { branchId, businessDate: expense.spentOn },
            },
        });
        if (closed && expense.paidFromCash)
            throw new common_1.BadRequestException('That day is already closed — the cash count includes this expense');
        await this.prisma.expense.delete({ where: { id } });
        return { ok: true };
    }
    async closingPreview(branchId, date, openingFloat = 0) {
        const from = dayStart(date);
        const range = (0, time_1.zonedRange)(date, date, await this.time.tzForBranch(branchId));
        const [sales, refunds, expenses] = await Promise.all([
            this.prisma.payment.aggregate({
                where: {
                    method: 'CASH',
                    createdAt: range,
                    order: { branchId },
                },
                _sum: { amount: true },
            }),
            this.prisma.refund.aggregate({
                where: {
                    method: 'CASH',
                    createdAt: range,
                    order: { branchId },
                },
                _sum: { amount: true },
            }),
            this.prisma.expense.aggregate({
                where: { branchId, spentOn: from, paidFromCash: true },
                _sum: { amount: true },
            }),
        ]);
        const cashSales = Number(sales._sum.amount ?? 0);
        const cashRefunds = Number(refunds._sum.amount ?? 0);
        const cashExpenses = Number(expenses._sum.amount ?? 0);
        return {
            businessDate: date,
            openingFloat,
            cashSales: (0, accounting_calc_1.round2)(cashSales - cashRefunds),
            cashExpenses: (0, accounting_calc_1.round2)(cashExpenses),
            expectedCash: (0, accounting_calc_1.expectedCash)(openingFloat, cashSales, cashRefunds, cashExpenses),
        };
    }
    async closeDay(branchId, userId, dto) {
        const existing = await this.prisma.cashClosing.findUnique({
            where: {
                branchId_businessDate: {
                    branchId,
                    businessDate: dayStart(dto.businessDate),
                },
            },
        });
        if (existing)
            throw new common_1.BadRequestException('This day is already closed');
        const p = await this.closingPreview(branchId, dto.businessDate, dto.openingFloat);
        return this.prisma.cashClosing.create({
            data: {
                branchId,
                businessDate: dayStart(dto.businessDate),
                openingFloat: dto.openingFloat,
                cashSales: p.cashSales,
                cashExpenses: p.cashExpenses,
                expectedCash: p.expectedCash,
                countedCash: dto.countedCash,
                variance: (0, accounting_calc_1.round2)(dto.countedCash - p.expectedCash),
                note: dto.note,
                closedById: userId,
            },
        });
    }
    listClosings(branchId) {
        return this.prisma.cashClosing.findMany({
            where: { branchId },
            orderBy: { businessDate: 'desc' },
            take: 60,
        });
    }
    async profitAndLoss(branchId, from, to) {
        const f = dayStart(from);
        const t = dayAfter(to);
        const range = (0, time_1.zonedRange)(from, to, await this.time.tzForBranch(branchId));
        const [orders, refunds, expenses, runs] = await Promise.all([
            this.prisma.order.aggregate({
                where: { branchId, status: 'PAID', billedAt: range },
                _sum: { totalAmount: true, tipAmount: true, taxAmount: true },
                _count: { _all: true },
            }),
            this.prisma.refund.aggregate({
                where: { createdAt: range, order: { branchId } },
                _sum: { amount: true },
            }),
            this.prisma.expense.groupBy({
                by: ['category'],
                where: { branchId, spentOn: { gte: f, lt: t } },
                _sum: { amount: true },
                orderBy: { category: 'asc' },
            }),
            this.prisma.payrollRun.findMany({
                where: {
                    branchId,
                    status: 'FINALIZED',
                    periodEnd: { gte: f, lt: t },
                },
                include: { lines: true },
            }),
        ]);
        const collected = Number(orders._sum.totalAmount ?? 0) - Number(orders._sum.tipAmount ?? 0);
        const tax = Number(orders._sum.taxAmount ?? 0);
        const refunded = Number(refunds._sum.amount ?? 0);
        const netSales = (0, accounting_calc_1.round2)(collected - tax - refunded);
        const expenseRows = expenses.map((e) => ({
            category: e.category,
            amount: (0, accounting_calc_1.round2)(Number(e._sum.amount ?? 0)),
        }));
        const totalExpenses = (0, accounting_calc_1.round2)(expenseRows.reduce((s, e) => s + e.amount, 0));
        const payrollCost = (0, accounting_calc_1.round2)(runs
            .flatMap((r) => r.lines)
            .reduce((s, l) => s + Number(l.basePay) - Number(l.unpaidLeaveDeduction), 0));
        return {
            from,
            to,
            orders: orders._count._all,
            grossCollected: (0, accounting_calc_1.round2)(collected),
            taxCollected: (0, accounting_calc_1.round2)(tax),
            refunds: (0, accounting_calc_1.round2)(refunded),
            netSales,
            expenses: expenseRows,
            totalExpenses,
            payrollCost,
            netProfit: (0, accounting_calc_1.round2)(netSales - totalExpenses - payrollCost),
        };
    }
    async gstReport(branchId, from, to) {
        const orders = await this.prisma.order.findMany({
            where: {
                branchId,
                status: 'PAID',
                billedAt: (0, time_1.zonedRange)(from, to, await this.time.tzForBranch(branchId)),
            },
            select: {
                subtotal: true,
                discountAmount: true,
                loyaltyDiscountAmount: true,
                items: { select: { lineTotal: true, taxRateSnapshot: true } },
            },
        });
        const lines = orders.flatMap((o) => {
            const subtotal = Number(o.subtotal);
            const charged = subtotal - Number(o.discountAmount) - Number(o.loyaltyDiscountAmount);
            const factor = subtotal > 0 ? Math.max(0, charged) / subtotal : 1;
            return o.items.map((i) => ({
                lineTotal: Number(i.lineTotal),
                taxRatePercent: Number(i.taxRateSnapshot),
                factor,
            }));
        });
        return { from, to, orders: orders.length, ...(0, accounting_calc_1.gstSummary)(lines) };
    }
    async branchOverview(restaurantId, from, to) {
        const range = (0, time_1.zonedRange)(from, to, await this.time.tzForRestaurant(restaurantId));
        const branches = await this.prisma.branch.findMany({
            where: { restaurantId, isActive: true },
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
        });
        return Promise.all(branches.map(async (b) => {
            const [sales, open, ingredients] = await Promise.all([
                this.prisma.order.aggregate({
                    where: {
                        branchId: b.id,
                        status: 'PAID',
                        billedAt: range,
                    },
                    _sum: { totalAmount: true },
                    _count: { _all: true },
                }),
                this.prisma.order.count({
                    where: { branchId: b.id, status: 'OPEN' },
                }),
                this.prisma.ingredient.findMany({
                    where: { branchId: b.id },
                    select: {
                        currentStock: true,
                        reorderLevel: true,
                        costPerUnit: true,
                    },
                }),
            ]);
            return {
                branchId: b.id,
                name: b.name,
                orders: sales._count._all,
                sales: (0, accounting_calc_1.round2)(Number(sales._sum.totalAmount ?? 0)),
                openOrders: open,
                lowStockItems: ingredients.filter((i) => Number(i.reorderLevel) > 0 &&
                    Number(i.currentStock) <= Number(i.reorderLevel)).length,
                inventoryValue: (0, accounting_calc_1.round2)(ingredients.reduce((s, i) => s + Number(i.currentStock) * Number(i.costPerUnit), 0)),
            };
        }));
    }
};
exports.AccountingService = AccountingService;
exports.AccountingService = AccountingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        branch_time_service_1.BranchTimeService])
], AccountingService);
//# sourceMappingURL=accounting.service.js.map