"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PrismaExceptionFilter = class PrismaExceptionFilter {
    catch(exception, host) {
        const response = host.switchToHttp().getResponse();
        const httpException = this.toHttpException(exception);
        const body = httpException.getResponse();
        response
            .status(httpException.getStatus())
            .json(typeof body === 'string'
            ? { statusCode: httpException.getStatus(), message: body }
            : body);
    }
    toHttpException(exception) {
        if (exception instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            switch (exception.code) {
                case 'P2002':
                    return new common_1.ConflictException(this.uniqueConstraintMessage(exception));
                case 'P2025':
                    return new common_1.NotFoundException('That record no longer exists — it may have just been changed or removed by someone else.');
                case 'P2003':
                    return new common_1.BadRequestException('This action references something that does not exist or was already removed.');
                default:
                    return new common_1.InternalServerErrorException('Something went wrong. Please try again.');
            }
        }
        return new common_1.BadRequestException('The request could not be processed.');
    }
    uniqueConstraintMessage(exception) {
        const target = exception.meta?.target ?? [];
        if (target.includes('number') && target.includes('floorId')) {
            return 'That table number is already used on this floor. Choose a different number.';
        }
        if (target.includes('qrToken')) {
            return 'That QR code is already assigned to another table.';
        }
        if (target.includes('email')) {
            return 'That email address is already in use.';
        }
        if (target.includes('code')) {
            return 'That code is already in use.';
        }
        if (target.includes('name')) {
            return 'That name is already in use. Choose a different one.';
        }
        const fields = target.join(', ') || 'value';
        return `A record with this ${fields} already exists.`;
    }
};
exports.PrismaExceptionFilter = PrismaExceptionFilter;
exports.PrismaExceptionFilter = PrismaExceptionFilter = __decorate([
    (0, common_1.Catch)(client_1.Prisma.PrismaClientKnownRequestError, client_1.Prisma.PrismaClientValidationError)
], PrismaExceptionFilter);
//# sourceMappingURL=prisma-exception.filter.js.map