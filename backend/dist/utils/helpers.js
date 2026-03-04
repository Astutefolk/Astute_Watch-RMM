"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiErrors = exports.AppError = void 0;
exports.hashPassword = hashPassword;
exports.comparePasswords = comparePasswords;
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
exports.generateApiKey = generateApiKey;
exports.hashApiKey = hashApiKey;
exports.generateDeviceId = generateDeviceId;
exports.isValidEmail = isValidEmail;
exports.validatePassword = validatePassword;
exports.getPaginationParams = getPaginationParams;
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("@/config/env");
// ============ Password Hashing ============
async function hashPassword(password) {
    return bcryptjs_1.default.hash(password, env_1.envConfig.bcryptRounds);
}
async function comparePasswords(password, hash) {
    return bcryptjs_1.default.compare(password, hash);
}
// ============ JWT Token Management ============
function generateAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.envConfig.jwtSecret, {
        expiresIn: env_1.envConfig.jwtExpiresIn,
    });
}
function generateRefreshToken(userId) {
    return jsonwebtoken_1.default.sign({ userId }, env_1.envConfig.refreshTokenSecret, {
        expiresIn: env_1.envConfig.refreshTokenExpiresIn,
    });
}
function verifyAccessToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, env_1.envConfig.jwtSecret);
    }
    catch {
        return null;
    }
}
function verifyRefreshToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, env_1.envConfig.refreshTokenSecret);
    }
    catch {
        return null;
    }
}
// ============ API Key Generation ============
function generateApiKey() {
    return `key_${crypto_1.default.randomBytes(env_1.envConfig.apiKeyLength).toString('hex')}`;
}
function hashApiKey(apiKey) {
    return crypto_1.default.createHash('sha256').update(apiKey).digest('hex');
}
// ============ ID Generation ============
function generateDeviceId() {
    return `dev_${crypto_1.default.randomBytes(12).toString('hex')}`;
}
// ============ Validation ============
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
function validatePassword(password) {
    const errors = [];
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
// ============ Pagination ============
function getPaginationParams(page, limit) {
    const pageNum = Math.max(1, parseInt(page || '1', 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit || '10', 10)));
    return {
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
    };
}
// ============ Error Handling ============
class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
exports.ApiErrors = {
    INVALID_CREDENTIALS: new AppError(401, 'Invalid email or password'),
    UNAUTHORIZED: new AppError(401, 'Unauthorized'),
    FORBIDDEN: new AppError(403, 'Forbidden'),
    NOT_FOUND: new AppError(404, 'Resource not found'),
    CONFLICT: new AppError(409, 'Resource already exists'),
    VALIDATION_ERROR: (message) => new AppError(400, message),
    INTERNAL_ERROR: new AppError(500, 'Internal server error'),
};
//# sourceMappingURL=helpers.js.map