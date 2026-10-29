import { ConfigService } from '@nestjs/config';
export interface OutgoingEmail {
    to: string;
    subject: string;
    text: string;
    attachments?: {
        filename: string;
        content: Buffer;
        contentType?: string;
    }[];
}
export declare class EmailService {
    private readonly config;
    private readonly logger;
    private transporter;
    constructor(config: ConfigService);
    private get from();
    isConfigured(): boolean;
    private getTransport;
    send(mail: OutgoingEmail): Promise<void>;
    sendEach(mails: OutgoingEmail[]): Promise<{
        sent: number;
        failed: number;
    }>;
}
