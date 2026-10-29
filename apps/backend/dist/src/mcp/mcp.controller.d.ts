import type { Request, Response } from 'express';
import { McpToolsBuilder } from './mcp-tools.builder';
export declare class McpController {
    private readonly toolsBuilder;
    constructor(toolsBuilder: McpToolsBuilder);
    handlePost(req: Request, res: Response): Promise<void>;
    handleGet(res: Response): void;
    handleDelete(res: Response): void;
}
