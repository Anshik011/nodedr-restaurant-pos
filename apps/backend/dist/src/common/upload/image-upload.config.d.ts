import type { Request } from 'express';
import { type FileFilterCallback } from 'multer';
export declare function uploadsDir(): string;
export declare const imageUploadOptions: {
    storage: import("multer").StorageEngine;
    limits: {
        fileSize: number;
    };
    fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => void;
};
export declare function assertValidImageSignature(filePath: string): void;
