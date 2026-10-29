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
var AuditInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditInterceptor = exports.AuditAction = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const rxjs_1 = require("rxjs");
const audit_service_1 = require("./audit.service");
const AUDIT_KEY = 'audit-action';
const AuditAction = (action, entity) => (0, common_1.applyDecorators)((0, common_1.SetMetadata)(AUDIT_KEY, { action, entity }), (0, common_1.UseInterceptors)(AuditInterceptor));
exports.AuditAction = AuditAction;
let AuditInterceptor = AuditInterceptor_1 = class AuditInterceptor {
    reflector;
    audit;
    logger = new common_1.Logger(AuditInterceptor_1.name);
    constructor(reflector, audit) {
        this.reflector = reflector;
        this.audit = audit;
    }
    intercept(context, next) {
        const meta = this.reflector.get(AUDIT_KEY, context.getHandler());
        const req = context
            .switchToHttp()
            .getRequest();
        return next.handle().pipe((0, rxjs_1.tap)((result) => {
            if (!meta)
                return;
            const params = req.params;
            const resultId = result && typeof result === 'object' && 'id' in result
                ? String(result.id)
                : null;
            const branchId = typeof req.query.branchId === 'string'
                ? req.query.branchId
                : undefined;
            void this.audit
                .record({
                userId: req.user?.id ?? null,
                action: meta.action,
                entity: meta.entity,
                entityId: params.id ?? params.userId ?? params.orderId ?? resultId,
                metadata: { ...(branchId ? { branchId } : {}), ...params },
            })
                .catch((err) => this.logger.warn(`audit write failed: ${String(err)}`));
        }));
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = AuditInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        audit_service_1.AuditService])
], AuditInterceptor);
//# sourceMappingURL=audit-action.js.map