"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireScope = exports.INTEGRATION_SCOPES_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.INTEGRATION_SCOPES_KEY = 'requiredIntegrationScopes';
const RequireScope = (...scopes) => (0, common_1.SetMetadata)(exports.INTEGRATION_SCOPES_KEY, scopes);
exports.RequireScope = RequireScope;
//# sourceMappingURL=require-scope.decorator.js.map