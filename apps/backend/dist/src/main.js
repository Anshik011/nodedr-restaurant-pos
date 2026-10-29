"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodeCrypto = __importStar(require("node:crypto"));
if (typeof globalThis.crypto === 'undefined') {
    globalThis.crypto = nodeCrypto;
}
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const node_crypto_1 = require("node:crypto");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const app_module_1 = require("./app.module");
const image_upload_config_1 = require("./common/upload/image-upload.config");
const KNOWN_PLACEHOLDER_JWT_SECRETS = new Set([
    'please-change-this-to-a-long-random-string',
    'change-me-to-a-long-random-string',
    'change-me',
    'changeme',
    'secret',
    'your-secret-here',
]);
const MIN_JWT_SECRET_LENGTH = 32;
const JWT_SECRET_STATE_FILE = process.env.JWT_SECRET_STATE_FILE ?? '/data/state/jwt-secret';
function isUsableSecret(secret) {
    return (secret.length >= MIN_JWT_SECRET_LENGTH &&
        !KNOWN_PLACEHOLDER_JWT_SECRETS.has(secret.toLowerCase()));
}
function resolveJwtSecret() {
    const envSecret = (process.env.JWT_SECRET ?? '').trim();
    if (isUsableSecret(envSecret)) {
        return envSecret;
    }
    try {
        if ((0, node_fs_1.existsSync)(JWT_SECRET_STATE_FILE)) {
            const persisted = (0, node_fs_1.readFileSync)(JWT_SECRET_STATE_FILE, 'utf8').trim();
            if (isUsableSecret(persisted)) {
                return persisted;
            }
        }
        const generated = (0, node_crypto_1.randomBytes)(32).toString('hex');
        (0, node_fs_1.mkdirSync)((0, node_path_1.dirname)(JWT_SECRET_STATE_FILE), { recursive: true });
        (0, node_fs_1.writeFileSync)(JWT_SECRET_STATE_FILE, generated, { mode: 0o600 });
        console.warn(`JWT_SECRET was not set (or was a known placeholder) — generated a random one and saved it to ${JWT_SECRET_STATE_FILE}. ` +
            'It will be reused on every restart, so existing sessions stay valid. Set JWT_SECRET explicitly instead if you manage this deployment by hand.');
        return generated;
    }
    catch (err) {
        console.error(`Refusing to start: JWT_SECRET is missing, a known placeholder value, or shorter than ${MIN_JWT_SECRET_LENGTH} characters, ` +
            `and a random one could not be generated/persisted at ${JWT_SECRET_STATE_FILE}: ${err instanceof Error ? err.message : String(err)}. ` +
            'Set a real, unique, random JWT_SECRET (e.g. `openssl rand -hex 32`) before starting the backend — ' +
            'this protects every session this server will ever issue.');
        process.exit(1);
    }
}
async function bootstrap() {
    process.env.JWT_SECRET = resolveJwtSecret();
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));
    app.use((0, cookie_parser_1.default)());
    app.enableCors({
        origin: process.env.CORS_ORIGIN ?? 'http://localhost:1995',
        credentials: true,
    });
    app.setGlobalPrefix('api');
    app.useStaticAssets((0, image_upload_config_1.uploadsDir)(), { prefix: '/api/uploads/' });
    if (process.env.NODE_ENV !== 'production' ||
        process.env.ENABLE_SWAGGER === 'true') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('Uptoware Restaurant ERP API')
            .setDescription('REST API for the Uptoware Restaurant ERP management system')
            .setVersion('1.0')
            .addCookieAuth('uptoware_session')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document);
    }
    const port = process.env.PORT ?? 4000;
    await app.listen(port);
    console.log(`Uptoware Restaurant ERP API listening on :${port} (docs at /api/docs)`);
}
void bootstrap();
//# sourceMappingURL=main.js.map