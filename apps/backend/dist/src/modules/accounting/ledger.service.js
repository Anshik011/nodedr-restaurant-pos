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
exports.LedgerService = void 0;
exports.parseCsvLine = parseCsvLine;
exports.parseStatement = parseStatement;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const money_1 = require("../../common/money");
const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
function parseCsvLine(line) {
    const out = [];
    let cur = '';
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (quoted) {
            if (c === '"' && line[i + 1] === '"') {
                cur += '"';
                i++;
            }
            else if (c === '"')
                quoted = false;
            else
                cur += c;
        }
        else if (c === '"')
            quoted = true;
        else if (c === ',') {
            out.push(cur);
            cur = '';
        }
        else
            cur += c;
    }
    out.push(cur);
    return out.map((s) => s.trim());
}
function toIsoDate(raw) {
    const s = raw.trim();
    let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    if (m)
        return `${m[1]}-${m[2]}-${m[3]}`;
    m = /^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/.exec(s);
    if (m) {
        const y = m[3].length === 2 ? `20${m[3]}` : m[3];
        return `${y}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    }
    return null;
}
const num = (raw) => {
    if (!raw)
        return 0;
    const n = Number(raw.replace(/[,₹$\s]/g, ''));
    return Number.isFinite(n) ? n : 0;
};
function parseStatement(csv) {
    const lines = csv
        .replace(/^\uFEFF/, '')
        .split(/\r?\n/)
        .filter((l) => l.trim());
    if (lines.length < 2)
        throw new common_1.BadRequestException('The statement has no rows');
    const head = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
    const find = (...names) => head.findIndex((h) => names.some((n) => h.includes(n)));
    const iDate = find('date');
    const iDesc = find('description', 'narration', 'particulars', 'details');
    const iRef = find('reference', 'ref', 'cheque', 'utr');
    const iAmount = head.findIndex((h) => h === 'amount');
    const iDebit = find('debit', 'withdrawal');
    const iCredit = find('credit', 'deposit');
    if (iDate < 0 || iDesc < 0 || (iAmount < 0 && iDebit < 0 && iCredit < 0))
        throw new common_1.BadRequestException('Statement needs date, description and amount (or debit/credit) columns');
    const rows = [];
    const skipped = [];
    lines.slice(1).forEach((line, idx) => {
        const c = parseCsvLine(line);
        const postedOn = toIsoDate(c[iDate] ?? '');
        const amount = iAmount >= 0 ? num(c[iAmount]) : num(c[iCredit]) - num(c[iDebit]);
        if (!postedOn || !amount) {
            skipped.push(idx + 2);
            return;
        }
        rows.push({
            postedOn,
            description: (c[iDesc] ?? '').slice(0, 300) || 'Bank transaction',
            reference: iRef >= 0 ? (c[iRef] ?? '').slice(0, 80) : '',
            amount: (0, money_1.round2)(amount),
        });
    });
    return { rows, skipped };
}
let LedgerService = class LedgerService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async setBudget(branchId, dto) {
        if (!MONTH.test(dto.month))
            throw new common_1.BadRequestException('Month must look like 2026-10');
        const category = dto.category.trim();
        if (!category)
            throw new common_1.BadRequestException('Category is required');
        return this.prisma.budget.upsert({
            where: {
                branchId_month_category: { branchId, month: dto.month, category },
            },
            update: { amount: dto.amount },
            create: { branchId, month: dto.month, category, amount: dto.amount },
        });
    }
    async deleteBudget(branchId, id) {
        const b = await this.prisma.budget.findFirst({ where: { id, branchId } });
        if (!b)
            throw new common_1.NotFoundException('Budget not found');
        await this.prisma.budget.delete({ where: { id } });
        return { ok: true };
    }
    async budgetVsActual(branchId, month) {
        if (!MONTH.test(month))
            throw new common_1.BadRequestException('Month must look like 2026-10');
        const [y, m] = month.split('-').map(Number);
        const from = new Date(Date.UTC(y, m - 1, 1));
        const to = new Date(Date.UTC(y, m, 1));
        const [budgets, spend] = await Promise.all([
            this.prisma.budget.findMany({
                where: { branchId, month },
                orderBy: { category: 'asc' },
            }),
            this.prisma.expense.groupBy({
                by: ['category'],
                where: { branchId, spentOn: { gte: from, lt: to } },
                _sum: { amount: true },
            }),
        ]);
        const actualBy = new Map();
        for (const s of spend)
            actualBy.set(s.category.trim().toLowerCase(), (0, money_1.round2)(Number(s._sum.amount ?? 0)));
        const used = new Set();
        const rows = budgets.map((b) => {
            const key = b.category.trim().toLowerCase();
            used.add(key);
            const budget = Number(b.amount);
            const actual = actualBy.get(key) ?? 0;
            return {
                id: b.id,
                category: b.category,
                budget,
                actual,
                remaining: (0, money_1.round2)(budget - actual),
                percentUsed: budget > 0 ? Math.round((actual / budget) * 100) : 0,
            };
        });
        const unbudgeted = [...actualBy.entries()]
            .filter(([k]) => !used.has(k))
            .map(([category, actual]) => ({ category, actual }));
        const totalBudget = (0, money_1.round2)(rows.reduce((s, r) => s + r.budget, 0));
        const totalActual = (0, money_1.round2)(rows.reduce((s, r) => s + r.actual, 0));
        return {
            month,
            rows,
            unbudgeted,
            totalBudget,
            totalActual,
            remaining: (0, money_1.round2)(totalBudget - totalActual),
        };
    }
    async importStatement(branchId, csv) {
        const { rows, skipped } = parseStatement(csv);
        if (rows.length > 5000)
            throw new common_1.BadRequestException('Import at most 5000 rows at a time');
        const res = await this.prisma.bankTransaction.createMany({
            data: rows.map((r) => ({
                branchId,
                postedOn: new Date(`${r.postedOn}T00:00:00.000Z`),
                description: r.description,
                reference: r.reference,
                amount: r.amount,
            })),
            skipDuplicates: true,
        });
        const matched = await this.autoMatch(branchId);
        return {
            imported: res.count,
            duplicatesIgnored: rows.length - res.count,
            skippedLines: skipped,
            autoMatched: matched,
        };
    }
    async autoMatch(branchId) {
        const txs = await this.prisma.bankTransaction.findMany({
            where: { branchId, status: 'UNMATCHED', amount: { lt: 0 } },
            orderBy: { postedOn: 'asc' },
        });
        if (!txs.length)
            return 0;
        const taken = new Set((await this.prisma.bankTransaction.findMany({
            where: { branchId, expenseId: { not: null } },
            select: { expenseId: true },
        })).map((t) => t.expenseId));
        const expenses = await this.prisma.expense.findMany({
            where: { branchId, paidFromCash: false },
        });
        let count = 0;
        for (const t of txs) {
            const amt = Math.abs(Number(t.amount));
            const best = expenses
                .filter((e) => !taken.has(e.id) &&
                Math.abs(Number(e.amount) - amt) < 0.005 &&
                Math.abs(e.spentOn.getTime() - t.postedOn.getTime()) <=
                    5 * 86400000)
                .sort((a, b) => Math.abs(a.spentOn.getTime() - t.postedOn.getTime()) -
                Math.abs(b.spentOn.getTime() - t.postedOn.getTime()))[0];
            if (!best)
                continue;
            taken.add(best.id);
            await this.prisma.bankTransaction.update({
                where: { id: t.id },
                data: { status: 'MATCHED', expenseId: best.id },
            });
            count++;
        }
        return count;
    }
    async reconciliation(branchId, from, to) {
        const where = {
            branchId,
            ...(from || to
                ? {
                    postedOn: {
                        ...(from ? { gte: new Date(`${from}T00:00:00.000Z`) } : {}),
                        ...(to ? { lte: new Date(`${to}T00:00:00.000Z`) } : {}),
                    },
                }
                : {}),
        };
        const txs = await this.prisma.bankTransaction.findMany({
            where,
            orderBy: [{ postedOn: 'desc' }, { createdAt: 'desc' }],
            take: 1000,
        });
        const expenseIds = txs.map((t) => t.expenseId).filter(Boolean);
        const expenses = expenseIds.length
            ? await this.prisma.expense.findMany({
                where: { id: { in: expenseIds } },
                select: { id: true, category: true, note: true, spentOn: true },
            })
            : [];
        const byId = new Map(expenses.map((e) => [e.id, e]));
        const count = (s) => txs.filter((t) => t.status === s).length;
        return {
            summary: {
                total: txs.length,
                matched: count('MATCHED'),
                unmatched: count('UNMATCHED'),
                ignored: count('IGNORED'),
                moneyIn: (0, money_1.round2)(txs
                    .filter((t) => Number(t.amount) > 0)
                    .reduce((s, t) => s + Number(t.amount), 0)),
                moneyOut: (0, money_1.round2)(txs
                    .filter((t) => Number(t.amount) < 0)
                    .reduce((s, t) => s + Number(t.amount), 0)),
            },
            transactions: txs.map((t) => ({
                id: t.id,
                postedOn: t.postedOn,
                description: t.description,
                reference: t.reference,
                amount: Number(t.amount),
                status: t.status,
                expense: t.expenseId ? (byId.get(t.expenseId) ?? null) : null,
            })),
        };
    }
    async setBankStatus(branchId, id, status) {
        const t = await this.prisma.bankTransaction.findFirst({
            where: { id, branchId },
        });
        if (!t)
            throw new common_1.NotFoundException('Bank transaction not found');
        return this.prisma.bankTransaction.update({
            where: { id },
            data: { status, expenseId: null },
        });
    }
    async matchCandidates(branchId, id) {
        const t = await this.prisma.bankTransaction.findFirst({
            where: { id, branchId },
        });
        if (!t)
            throw new common_1.NotFoundException('Bank transaction not found');
        const taken = (await this.prisma.bankTransaction.findMany({
            where: { branchId, expenseId: { not: null } },
            select: { expenseId: true },
        })).map((x) => x.expenseId);
        const around = 15 * 86400000;
        return this.prisma.expense.findMany({
            where: {
                branchId,
                id: { notIn: taken },
                spentOn: {
                    gte: new Date(t.postedOn.getTime() - around),
                    lte: new Date(t.postedOn.getTime() + around),
                },
            },
            orderBy: { spentOn: 'desc' },
            take: 50,
        });
    }
    async matchManually(branchId, id, expenseId) {
        const [t, e] = await Promise.all([
            this.prisma.bankTransaction.findFirst({ where: { id, branchId } }),
            this.prisma.expense.findFirst({ where: { id: expenseId, branchId } }),
        ]);
        if (!t || !e)
            throw new common_1.NotFoundException('Transaction or expense not found');
        const used = await this.prisma.bankTransaction.findFirst({
            where: { branchId, expenseId, NOT: { id } },
        });
        if (used)
            throw new common_1.BadRequestException('That expense is already matched');
        return this.prisma.bankTransaction.update({
            where: { id },
            data: { status: 'MATCHED', expenseId },
        });
    }
    async balanceSheet(branchId, asOf) {
        const end = new Date(`${asOf}T23:59:59.999Z`);
        const endDate = new Date(`${asOf}T00:00:00.000Z`);
        const [payments, refunds, expenses, supplierPaid, payroll, ingredients, invoices, giftCards,] = await Promise.all([
            this.prisma.payment.aggregate({
                where: {
                    order: { branchId },
                    createdAt: { lte: end },
                    method: {
                        in: ['CASH', 'CARD', 'UPI', 'WALLET', 'BANK_TRANSFER', 'OTHER'],
                    },
                },
                _sum: { amount: true },
            }),
            this.prisma.refund.aggregate({
                where: { order: { branchId }, createdAt: { lte: end } },
                _sum: { amount: true },
            }),
            this.prisma.expense.aggregate({
                where: { branchId, spentOn: { lte: endDate } },
                _sum: { amount: true },
            }),
            this.prisma.supplierPayment.aggregate({
                where: { branchId, paidAt: { lte: end } },
                _sum: { amount: true },
            }),
            this.prisma.payrollRun.findMany({
                where: { branchId, status: 'FINALIZED', periodEnd: { lte: endDate } },
                include: { lines: true },
            }),
            this.prisma.ingredient.findMany({
                where: { branchId },
                select: { currentStock: true, costPerUnit: true },
            }),
            this.prisma.supplierInvoice.findMany({
                where: { branchId, invoiceDate: { lte: end } },
                select: { totalAmount: true, amountPaid: true },
            }),
            this.prisma.giftCard.findMany({
                where: { branchId },
                select: { balance: true },
            }),
        ]);
        const payrollPaid = (0, money_1.round2)(payroll
            .flatMap((r) => r.lines)
            .reduce((s, l) => s + Number(l.basePay) - Number(l.unpaidLeaveDeduction), 0));
        const cash = (0, money_1.round2)(Number(payments._sum.amount ?? 0) -
            Number(refunds._sum.amount ?? 0) -
            Number(expenses._sum.amount ?? 0) -
            Number(supplierPaid._sum.amount ?? 0) -
            payrollPaid);
        const inventory = (0, money_1.round2)(ingredients.reduce((s, i) => s + Math.max(0, Number(i.currentStock)) * Number(i.costPerUnit), 0));
        const payables = (0, money_1.round2)(invoices.reduce((s, i) => s + Math.max(0, Number(i.totalAmount) - Number(i.amountPaid)), 0));
        const giftLiability = (0, money_1.round2)(giftCards.reduce((s, g) => s + Number(g.balance), 0));
        const totalAssets = (0, money_1.round2)(cash + inventory);
        const totalLiabilities = (0, money_1.round2)(payables + giftLiability);
        return {
            asOf,
            assets: [
                { label: 'Cash and bank (net of all payments out)', amount: cash },
                { label: 'Inventory at cost', amount: inventory },
            ],
            liabilities: [
                { label: 'Supplier invoices unpaid', amount: payables },
                { label: 'Gift card balances owed', amount: giftLiability },
            ],
            totalAssets,
            totalLiabilities,
            equity: (0, money_1.round2)(totalAssets - totalLiabilities),
            note: 'Management snapshot built from POS records, not a statutory balance sheet.',
        };
    }
};
exports.LedgerService = LedgerService;
exports.LedgerService = LedgerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LedgerService);
//# sourceMappingURL=ledger.service.js.map