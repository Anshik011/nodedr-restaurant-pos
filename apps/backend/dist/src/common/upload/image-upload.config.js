"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageUploadOptions = void 0;
exports.uploadsDir = uploadsDir;
exports.assertValidImageSignature = assertValidImageSignature;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const multer_1 = require("multer");
function uploadsDir() {
    const dir = process.env.UPLOADS_DIR ?? (0, node_path_1.join)(process.cwd(), 'uploads');
    if (!(0, node_fs_1.existsSync)(dir)) {
        (0, node_fs_1.mkdirSync)(dir, { recursive: true });
    }
    return dir;
}
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
exports.imageUploadOptions = {
    storage: (0, multer_1.diskStorage)({
        destination: (_req, _file, cb) => cb(null, uploadsDir()),
        filename: (_req, file, cb) => {
            const ext = (0, node_path_1.extname)(file.originalname).toLowerCase();
            cb(null, `${(0, node_crypto_1.randomUUID)()}${ALLOWED_EXTENSIONS.has(ext) ? ext : '.jpg'}`);
        },
    }),
    limits: { fileSize: MAX_FILE_SIZE_BYTES },
    fileFilter: (_req, file, cb) => {
        const ext = (0, node_path_1.extname)(file.originalname).toLowerCase();
        if (!ALLOWED_EXTENSIONS.has(ext) || !file.mimetype.startsWith('image/')) {
            cb(new common_1.BadRequestException('Only image files (jpg, png, webp, gif) are allowed'));
            return;
        }
        cb(null, true);
    },
};
const SIGNATURES = [
    { match: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
    {
        match: (b) => b[0] === 0x89 &&
            b[1] === 0x50 &&
            b[2] === 0x4e &&
            b[3] === 0x47 &&
            b[4] === 0x0d &&
            b[5] === 0x0a &&
            b[6] === 0x1a &&
            b[7] === 0x0a,
    },
    { match: (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 },
    {
        match: (b) => b[0] === 0x52 &&
            b[1] === 0x49 &&
            b[2] === 0x46 &&
            b[3] === 0x46 &&
            b[8] === 0x57 &&
            b[9] === 0x45 &&
            b[10] === 0x42 &&
            b[11] === 0x50,
    },
];
function assertValidImageSignature(filePath) {
    let header;
    try {
        header = (0, node_fs_1.readFileSync)(filePath).subarray(0, 16);
    }
    catch {
        throw new common_1.BadRequestException('Uploaded file could not be read');
    }
    const isValidImage = SIGNATURES.some((sig) => sig.match(header));
    if (!isValidImage) {
        try {
            (0, node_fs_1.unlinkSync)(filePath);
        }
        catch {
        }
        throw new common_1.BadRequestException('File content does not match a supported image format (jpg, png, webp, gif)');
    }
}
//# sourceMappingURL=image-upload.config.js.map