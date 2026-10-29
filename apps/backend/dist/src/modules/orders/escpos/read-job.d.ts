import { CODEPAGES } from './codepages';
export declare function readJob(buf: Buffer, codepage?: keyof typeof CODEPAGES): {
    commands: string[];
    lines: string[];
    text: string;
};
