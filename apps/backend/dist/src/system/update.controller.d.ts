import { UpdateService, type VersionInfo } from './update.service';
export declare class UpdateController {
    private readonly updateService;
    constructor(updateService: UpdateService);
    check(): Promise<VersionInfo>;
    progress(): Promise<{
        state: string;
        step?: string | null;
        error?: string | null;
    }>;
    apply(): Promise<{
        status: string;
        message: string;
    }>;
}
