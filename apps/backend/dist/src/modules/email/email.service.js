"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer_1 = require("nodemailer");
let EmailService = EmailService_1 = class EmailService {
    config;
    logger = new common_1.Logger(EmailService_1.name);
    transporter;
    constructor(config) {
        this.config = config;
    }
    get from() {
        return this.config.get('SMTP_FROM') ?? '';
    }
    isConfigured() {
        return !!this.config.get('SMTP_URL') && !!this.from;
    }
    getTransport() {
        if (this.transporter === undefined) {
            const url = this.config.get('SMTP_URL');
            this.transporter = url && this.from ? (0, nodemailer_1.createTransport)(url) : null;
        }
        if (!this.transporter)
            throw new Error('Email is not set up: set SMTP_URL and SMTP_FROM');
        return this.transporter;
    }
    async send(mail) {
        await this.getTransport().sendMail({ from: this.from, ...mail });
    }
    async sendEach(mails) {
        let sent = 0;
        let failed = 0;
        for (const mail of mails) {
            try {
                await this.send(mail);
                sent++;
            }
            catch (err) {
                failed++;
                this.logger.warn(`Email to ${mail.to} failed: ${err instanceof Error ? err.message : String(err)}`);
            }
        }
        return { sent, failed };
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map