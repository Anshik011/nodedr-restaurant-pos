import { CanActivate, ExecutionContext } from '@nestjs/common';
import { SyncService } from './sync.service';
export declare class SyncKeyGuard implements CanActivate {
    private readonly sync;
    constructor(sync: SyncService);
    canActivate(ctx: ExecutionContext): Promise<boolean>;
}
