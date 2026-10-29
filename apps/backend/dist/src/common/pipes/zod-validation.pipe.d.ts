import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import type { ZodSchema } from 'zod';
export declare class ZodValidationPipe<T> implements PipeTransform<unknown, unknown> {
    private readonly schema;
    constructor(schema: ZodSchema<T>);
    transform(value: unknown, metadata: ArgumentMetadata): unknown;
}
