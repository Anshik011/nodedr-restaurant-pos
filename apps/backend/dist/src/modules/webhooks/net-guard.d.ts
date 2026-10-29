export declare function isPrivateAddress(ip: string): boolean;
export interface WebhookNetOptions {
    allowPrivate: boolean;
    allowInsecure: boolean;
}
export declare function netOptionsFromEnv(env?: NodeJS.ProcessEnv): WebhookNetOptions;
export interface ResolvedTarget {
    url: URL;
    address: string;
    family: 4 | 6;
}
export declare function resolveWebhookTarget(raw: string, opts: WebhookNetOptions, resolve?: (host: string) => Promise<{
    address: string;
    family: number;
}[]>): Promise<ResolvedTarget>;
