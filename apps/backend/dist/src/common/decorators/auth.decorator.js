"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const permissions_guard_1 = require("../guards/permissions.guard");
const permissions_decorator_1 = require("./permissions.decorator");
const Auth = (...permissions) => (0, common_1.applyDecorators)((0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard), (0, permissions_decorator_1.RequirePermission)(...permissions), (0, swagger_1.ApiCookieAuth)());
exports.Auth = Auth;
//# sourceMappingURL=auth.decorator.js.map