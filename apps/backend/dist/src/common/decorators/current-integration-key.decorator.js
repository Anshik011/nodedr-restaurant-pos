"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentIntegrationKey = void 0;
const common_1 = require("@nestjs/common");
exports.CurrentIntegrationKey = (0, common_1.createParamDecorator)((_data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.integrationKey;
});
//# sourceMappingURL=current-integration-key.decorator.js.map