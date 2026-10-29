import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AuditService } from './audit.service';
export declare const AuditAction: (action: string, entity: string) => <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
export declare class AuditInterceptor implements NestInterceptor {
    private readonly reflector;
    private readonly audit;
    private readonly logger;
    constructor(reflector: Reflector, audit: AuditService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
}
