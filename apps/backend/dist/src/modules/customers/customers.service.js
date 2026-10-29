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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CustomersService = class CustomersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    list(branchId, search) {
        return this.prisma.customer.findMany({
            where: {
                branchId,
                ...(search
                    ? {
                        OR: [
                            { name: { contains: search, mode: 'insensitive' } },
                            { phone: { contains: search } },
                            { email: { contains: search, mode: 'insensitive' } },
                        ],
                    }
                    : {}),
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getById(branchId, id) {
        const customer = await this.prisma.customer.findFirst({
            where: { id, branchId },
            include: {
                orders: {
                    where: { status: 'PAID' },
                    orderBy: { billedAt: 'desc' },
                    take: 20,
                    select: {
                        id: true,
                        orderNumber: true,
                        totalAmount: true,
                        billedAt: true,
                    },
                },
                giftCards: true,
            },
        });
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        return customer;
    }
    create(branchId, dto) {
        return this.prisma.customer.create({ data: { ...dto, branchId } });
    }
    async update(branchId, id, dto) {
        await this.assertInBranch(branchId, id);
        return this.prisma.customer.update({ where: { id }, data: dto });
    }
    async remove(branchId, id) {
        await this.assertInBranch(branchId, id);
        await this.prisma.customer.delete({ where: { id } });
        return { ok: true };
    }
    async assertInBranch(branchId, id) {
        const customer = await this.prisma.customer.findFirst({
            where: { id, branchId },
        });
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map