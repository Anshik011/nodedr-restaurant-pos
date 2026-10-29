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
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const types_1 = require("@nodedr-restaurant/types");
const auth_decorator_1 = require("../../common/decorators/auth.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const branch_access_service_1 = require("../../common/services/branch-access.service");
const escpos_receipt_1 = require("./escpos-receipt");
const escpos_network_1 = require("./escpos-network");
const escpos_usb_1 = require("./escpos-usb");
const kot_print_service_1 = require("./kot-print.service");
const printer_transport_1 = require("./printer-transport");
const orders_service_1 = require("./orders.service");
const kot_html_1 = require("./kot.html");
const receipt_html_1 = require("./receipt.html");
const verifactu_service_1 = require("../verifactu/verifactu.service");
function branchPrinterProfile(branch) {
    return (0, escpos_receipt_1.resolveProfile)({
        paperWidthMm: branch.printerPaperWidthMm,
        codepage: branch.printerCodepage,
        columns: branch.printerColumns,
    });
}
function toKotOrder(order) {
    return {
        orderNumber: order.orderNumber,
        type: order.type,
        createdAt: order.createdAt,
        table: order.table
            ? { label: order.table.name ?? `#${order.table.number}` }
            : null,
        customer: order.customer ? { name: order.customer.name ?? 'Guest' } : null,
        items: order.items.map((item) => ({
            nameSnapshot: item.nameSnapshot,
            quantity: item.quantity,
            kitchenNote: item.kitchenNote,
            modifiers: item.modifiers.map((m) => ({ nameSnapshot: m.nameSnapshot })),
        })),
    };
}
function toEscposOrder(order, overrides) {
    return {
        orderNumber: order.orderNumber,
        type: order.type,
        createdAt: order.createdAt,
        table: order.table
            ? { label: order.table.name ?? `#${order.table.number}` }
            : null,
        customer: order.customer
            ? { name: order.customer.name ?? 'Guest', phone: order.customer.phone }
            : null,
        subtotal: Number(order.subtotal),
        discountAmount: Number(order.discountAmount),
        taxAmount: Number(order.taxAmount),
        tipAmount: Number(order.tipAmount),
        loyaltyPointsRedeemed: order.loyaltyPointsRedeemed,
        loyaltyDiscountAmount: Number(order.loyaltyDiscountAmount),
        totalAmount: Number(order.totalAmount),
        ...overrides,
        items: order.items.map((item) => ({
            nameSnapshot: item.nameSnapshot,
            quantity: item.quantity,
            unitPriceSnapshot: Number(item.unitPriceSnapshot),
            lineTotal: Number(item.lineTotal),
            taxRateSnapshot: Number(item.taxRateSnapshot),
            modifiers: item.modifiers.map((m) => ({
                nameSnapshot: m.nameSnapshot,
                priceAdjSnapshot: Number(m.priceAdjSnapshot),
            })),
        })),
        payments: order.payments.map((p) => ({
            method: p.method,
            amount: Number(p.amount),
            tendered: p.tendered ? Number(p.tendered) : null,
            changeGiven: p.changeGiven ? Number(p.changeGiven) : null,
        })),
    };
}
function assertMayAdjust(user, adj) {
    if (((adj.discountPercent ?? 0) > 0 ||
        (adj.discountFlat ?? 0) > 0 ||
        !!adj.couponCode) &&
        !user.permissions.includes('discounts.apply')) {
        throw new common_1.ForbiddenException('Missing permission to apply a discount at checkout');
    }
}
let OrdersController = class OrdersController {
    ordersService;
    branchAccess;
    kotPrint;
    verifactu;
    constructor(ordersService, branchAccess, kotPrint, verifactu) {
        this.ordersService = ordersService;
        this.branchAccess = branchAccess;
        this.kotPrint = kotPrint;
        this.verifactu = verifactu;
    }
    async listOpen(user, branchId, tableId) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.ordersService.listOpen(branchId, tableId);
    }
    async listForManagement(user, branchId, tab, channel, type) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.ordersService.listForManagement(branchId, {
            tab,
            channel,
            type,
        });
    }
    async getOrder(user, branchId, id) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.ordersService.getOrder(branchId, id);
    }
    async createOrder(user, branchId, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.ordersService.createOrder(branchId, user.id, body);
    }
    async addItems(user, branchId, id, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        const { items } = body;
        return this.ordersService.addItems(branchId, id, items);
    }
    async accept(user, branchId, id) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.ordersService.acceptOrder(branchId, id, user.id);
    }
    async reject(user, branchId, id, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        const { reason } = body;
        return this.ordersService.rejectOrder(branchId, id, user.id, reason);
    }
    async cancel(user, branchId, id, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        const { reason, confirmStarted, source } = types_1.cancelOrderSchema
            .partial()
            .parse(body ?? {});
        return this.ordersService.cancelOrder(branchId, id, user.id, reason, {
            confirmStarted,
            source,
        });
    }
    async update(user, branchId, id, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.ordersService.updateOrder(branchId, id, user.id, body);
    }
    async updateItem(user, branchId, id, itemId, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.ordersService.updateOrderItem(branchId, id, itemId, user.id, body);
    }
    async removeItem(user, branchId, id, itemId, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.ordersService.removeOrderItem(branchId, id, itemId, user.id, body.reason);
    }
    async discountPreview(user, branchId, id, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        if (body?.couponCode && !user.permissions.includes('discounts.apply')) {
            throw new common_1.ForbiddenException('Missing permission to apply a coupon');
        }
        return this.ordersService.previewDiscount(branchId, id, body?.couponCode);
    }
    async billPreview(user, branchId, id, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        const adj = body;
        assertMayAdjust(user, adj);
        return this.ordersService.previewBill(branchId, id, adj);
    }
    async checkout(user, branchId, id, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        const dto = body;
        assertMayAdjust(user, dto);
        if (((dto.discountPercent ?? 0) > 0 ||
            (dto.discountFlat ?? 0) > 0 ||
            !!dto.couponCode) &&
            !user.permissions.includes('discounts.apply')) {
            throw new common_1.ForbiddenException('Missing permission to apply a discount at checkout');
        }
        return this.ordersService.checkout(branchId, id, user.id, dto);
    }
    async receipt(user, branchId, id, query, res) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        const adj = types_1.billPreviewSchema.parse(query);
        assertMayAdjust(user, adj);
        const { order, overrides } = await this.ordersService.getBillForPrint(branchId, id, adj);
        if (overrides.isProvisional) {
            await this.ordersService.recordBillPrinted(branchId, id, user.id);
        }
        const html = (0, receipt_html_1.buildReceiptHtml)({
            restaurantName: order.branch.restaurant.name,
            currency: order.branch.restaurant.currency,
            branch: {
                name: order.branch.name,
                address: order.branch.address,
                phone: order.branch.phone,
                gstNumber: order.branch.gstNumber,
                taxRegime: order.branch.taxRegime,
                taxMode: order.branch.taxMode,
                taxLabel: order.branch.taxLabel,
                taxId: order.branch.taxId,
            },
            order: {
                ...toEscposOrder(order, overrides),
                verifactu: overrides.isProvisional
                    ? null
                    : await this.verifactu.qrForOrder(order.id),
            },
        });
        res.type('html').send(html);
    }
    async kot(user, branchId, id, res) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        const order = await this.ordersService.getReceiptData(branchId, id);
        const html = (0, kot_html_1.buildKotHtml)({
            branchName: order.branch.name,
            order: toKotOrder(order),
        });
        res.type('html').send(html);
    }
    async printDiagnostics(user, branchId) {
        const lpDevices = await (0, escpos_usb_1.probeCharDevices)();
        const libusbPrinter = (0, escpos_usb_1.findPrinterDescriptor)();
        let network = null;
        let connection = 'USB';
        if (branchId) {
            await this.branchAccess.assertAccess(user.restaurantId, branchId);
            const target = await this.ordersService.printerTarget(branchId);
            connection = target.printerConnection;
            if (connection === 'NETWORK' && target.printerHost) {
                network = {
                    host: target.printerHost,
                    port: target.printerPort,
                    ...(await (0, escpos_network_1.probeNetworkPrinter)({
                        host: target.printerHost,
                        port: target.printerPort,
                    })),
                };
            }
        }
        const canPrint = connection === 'NETWORK'
            ? network?.reachable === true
            : lpDevices.length > 0 || libusbPrinter !== null;
        return {
            connection,
            lpDevices,
            libusbPrinter,
            network,
            canPrint,
            notes: canPrint
                ? []
                : connection === 'NETWORK'
                    ? [
                        network
                            ? `Cannot reach ${network.host}:${network.port} from the server${network.error ? ` (${network.error})` : ''}.`
                            : 'Network printing is selected but no printer address is set.',
                    ]
                    : [
                        'No printer detected. On the till, check `lsusb` lists it and `ls -l /dev/usb/lp0` exists; the backend container needs the USB passthrough from docker-compose.yml (Linux host only). A server in the cloud cannot reach a USB or LAN printer - use a network printer the server can reach, or the browser print buttons.',
                    ],
        };
    }
    async printTest(user, branchId, kind) {
        let profile = (0, escpos_receipt_1.resolveProfile)();
        let target = {
            printerConnection: 'USB',
            printerHost: null,
            printerPort: 9100,
        };
        if (branchId) {
            await this.branchAccess.assertAccess(user.restaurantId, branchId);
            profile = await this.ordersService.printerProfile(branchId);
            target = await this.ordersService.printerTarget(branchId);
        }
        const buffer = kind === 'kot'
            ? (0, escpos_receipt_1.buildKotTestSlip)(profile).buffer
            : (0, escpos_receipt_1.buildTestSlip)(profile);
        await this.deliver(target, buffer);
        return { ok: true, profile };
    }
    async openDrawer(user, branchId) {
        let target = {
            printerConnection: 'USB',
            printerHost: null,
            printerPort: 9100,
        };
        if (branchId) {
            await this.branchAccess.assertAccess(user.restaurantId, branchId);
            target = await this.ordersService.printerTarget(branchId);
        }
        await this.deliver(target, (0, escpos_receipt_1.buildOpenDrawer)());
        return { ok: true };
    }
    async printUsb(user, branchId, id, width, drawer, query = {}) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        const adj = types_1.billPreviewSchema.parse(query);
        assertMayAdjust(user, adj);
        const { order, overrides } = await this.ordersService.getBillForPrint(branchId, id, adj);
        if (overrides.isProvisional) {
            await this.ordersService.recordBillPrinted(branchId, id, user.id);
        }
        const stored = branchPrinterProfile(order.branch);
        const profile = width === '58' || width === '80'
            ? (0, escpos_receipt_1.resolveProfile)({
                paperWidthMm: Number(width),
                codepage: stored.codepage,
            })
            : stored;
        const job = (0, escpos_receipt_1.buildReceiptEscPosJob)({
            restaurantName: order.branch.restaurant.name,
            currency: order.branch.restaurant.currency,
            branch: {
                name: order.branch.name,
                address: order.branch.address,
                phone: order.branch.phone,
                gstNumber: order.branch.gstNumber,
                taxRegime: order.branch.taxRegime,
                taxMode: order.branch.taxMode,
                taxLabel: order.branch.taxLabel,
                taxId: order.branch.taxId,
            },
            order: {
                ...toEscposOrder(order, overrides),
                verifactu: overrides.isProvisional
                    ? null
                    : await this.verifactu.qrForOrder(order.id),
            },
            profile,
            openDrawer: drawer === 'true' && !overrides.isProvisional,
        });
        return this.sendJob(job, order.branch);
    }
    async printKot(user, branchId, id, reprint) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.kotPrint.printOrder(branchId, id, reprint === 'true');
    }
    async printKotUsb(user, branchId, id, reprint) {
        return this.printKot(user, branchId, id, reprint);
    }
    async deliver(target, buffer) {
        try {
            await (0, printer_transport_1.sendToBranchPrinter)(target, buffer);
        }
        catch (err) {
            if (err instanceof escpos_usb_1.PrinterNotFoundError) {
                throw new common_1.ServiceUnavailableException(err.message);
            }
            throw err;
        }
    }
    async sendJob(job, target) {
        await this.deliver(target, job.buffer);
        return {
            ok: true,
            unsupportedChars: job.unsupportedChars,
        };
    }
    async refund(user, branchId, id, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        return this.ordersService.refund(branchId, id, user.id, body);
    }
    async deleteBulk(user, branchId, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        const { orderIds, password } = body;
        return this.ordersService.deleteFinishedOrders(branchId, user, orderIds, password);
    }
    async merge(user, branchId, id, body) {
        await this.branchAccess.assertAccess(user.restaurantId, branchId);
        const { sourceOrderId } = body;
        return this.ordersService.mergeOrders(branchId, id, sourceOrderId);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, auth_decorator_1.Auth)('orders.create'),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('tableId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "listOpen", null);
__decorate([
    (0, auth_decorator_1.Auth)('orders.create'),
    (0, common_1.Get)('manage'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('tab')),
    __param(3, (0, common_1.Query)('channel')),
    __param(4, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "listForManagement", null);
__decorate([
    (0, auth_decorator_1.Auth)('orders.create'),
    (0, common_1.Get)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrder", null);
__decorate([
    (0, auth_decorator_1.Auth)('orders.create'),
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.createOrderSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "createOrder", null);
__decorate([
    (0, auth_decorator_1.Auth)('orders.edit'),
    (0, common_1.Post)(':id/items'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.addOrderItemsSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "addItems", null);
__decorate([
    (0, auth_decorator_1.Auth)('orders.accept'),
    (0, common_1.Post)(':id/accept'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "accept", null);
__decorate([
    (0, auth_decorator_1.Auth)('orders.accept'),
    (0, common_1.Post)(':id/reject'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.rejectOrderSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "reject", null);
__decorate([
    (0, auth_decorator_1.Auth)('orders.cancel'),
    (0, common_1.Post)(':id/cancel'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "cancel", null);
__decorate([
    (0, auth_decorator_1.Auth)('orders.edit'),
    (0, common_1.Patch)(':id'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.updateOrderSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "update", null);
__decorate([
    (0, auth_decorator_1.Auth)('orders.edit'),
    (0, common_1.Patch)(':id/items/:itemId'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.updateOrderItemSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Param)('itemId')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateItem", null);
__decorate([
    (0, auth_decorator_1.Auth)('orders.edit'),
    (0, common_1.Post)(':id/items/:itemId/remove'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.removeOrderItemSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Param)('itemId')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "removeItem", null);
__decorate([
    (0, auth_decorator_1.Auth)('bills.print'),
    (0, common_1.Post)(':id/discount-preview'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "discountPreview", null);
__decorate([
    (0, auth_decorator_1.Auth)('bills.print'),
    (0, common_1.Post)(':id/bill-preview'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.billPreviewSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "billPreview", null);
__decorate([
    (0, auth_decorator_1.Auth)('bills.print'),
    (0, common_1.Post)(':id/checkout'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.checkoutSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "checkout", null);
__decorate([
    (0, auth_decorator_1.Auth)('bills.print'),
    (0, common_1.Get)(':id/receipt'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Query)()),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "receipt", null);
__decorate([
    (0, auth_decorator_1.Auth)('orders.create'),
    (0, common_1.Get)(':id/kot'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "kot", null);
__decorate([
    (0, auth_decorator_1.Auth)('bills.print'),
    (0, common_1.Get)('print/diagnostics'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "printDiagnostics", null);
__decorate([
    (0, auth_decorator_1.Auth)('bills.print'),
    (0, common_1.Post)('print/test'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Query)('kind')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "printTest", null);
__decorate([
    (0, auth_decorator_1.Auth)('bills.print'),
    (0, common_1.Post)('print/drawer'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "openDrawer", null);
__decorate([
    (0, auth_decorator_1.Auth)('bills.print'),
    (0, common_1.Post)(':id/print/usb'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Query)('width')),
    __param(4, (0, common_1.Query)('drawer')),
    __param(5, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "printUsb", null);
__decorate([
    (0, auth_decorator_1.Auth)('orders.create'),
    (0, common_1.Post)(':id/print/kot'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Query)('reprint')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "printKot", null);
__decorate([
    (0, auth_decorator_1.Auth)('orders.create'),
    (0, common_1.Post)(':id/print/kot/usb'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Query)('reprint')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "printKotUsb", null);
__decorate([
    (0, auth_decorator_1.Auth)('refunds.process'),
    (0, common_1.Post)(':id/refund'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.refundSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "refund", null);
__decorate([
    (0, auth_decorator_1.Auth)('orders.delete'),
    (0, common_1.Post)('delete-bulk'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.deleteOrdersSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "deleteBulk", null);
__decorate([
    (0, auth_decorator_1.Auth)('orders.edit'),
    (0, common_1.Post)(':id/merge'),
    (0, common_1.UsePipes)(new zod_validation_pipe_1.ZodValidationPipe(types_1.mergeOrdersSchema)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "merge", null);
exports.OrdersController = OrdersController = __decorate([
    (0, swagger_1.ApiTags)('orders'),
    (0, common_1.Controller)('v1/orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService,
        branch_access_service_1.BranchAccessService,
        kot_print_service_1.KotPrintService,
        verifactu_service_1.VerifactuService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map