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
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.refreshToken = refreshToken;
exports.me = me;
exports.getApiKeys = getApiKeys;
exports.createApiKey = createApiKey;
exports.toggleApiKey = toggleApiKey;
const auth_1 = require("@/services/auth");
const helpers_1 = require("@/utils/helpers");
let authService = null;
function getAuthService() {
    if (!authService) {
        authService = new auth_1.AuthService();
    }
    return authService;
}
async function register(req, res) {
    try {
        const { email, password, organizationName } = req.body;
        if (!email || !password || !organizationName) {
            return res.status(400).json({
                error: 'Missing required fields: email, password, organizationName',
            });
        }
        const result = await getAuthService().register(email, password, organizationName);
        // Generate tokens
        const accessToken = (0, helpers_1.generateAccessToken)({
            userId: result.userId,
            orgId: result.orgId,
            email: result.email,
            role: 'ADMIN',
        });
        const refreshToken = (0, helpers_1.generateRefreshToken)(result.userId);
        return res.status(201).json({
            accessToken,
            refreshToken,
            user: {
                userId: result.userId,
                email: result.email,
                orgId: result.orgId,
            },
            apiKey: result.apiKey,
        });
    }
    catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: error.message });
    }
}
async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                error: 'Missing required fields: email, password',
            });
        }
        const user = await getAuthService().login(email, password);
        // Generate tokens
        const accessToken = (0, helpers_1.generateAccessToken)({
            userId: user.userId,
            orgId: user.orgId,
            email: user.email,
            role: user.role,
        });
        const refreshToken = (0, helpers_1.generateRefreshToken)(user.userId);
        return res.json({
            accessToken,
            refreshToken,
            user: {
                userId: user.userId,
                email: user.email,
                orgId: user.orgId,
                role: user.role,
            },
        });
    }
    catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: error.message });
    }
}
async function refreshToken(req, res) {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: 'Missing refreshToken' });
        }
        const { verifyRefreshToken } = await Promise.resolve().then(() => __importStar(require('@/utils/helpers')));
        const payload = verifyRefreshToken(refreshToken);
        if (!payload) {
            return res.status(401).json({ error: 'Invalid or expired refresh token' });
        }
        const user = await getAuthService().findUserById(payload.userId);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        // Generate new access token
        const accessToken = (0, helpers_1.generateAccessToken)({
            userId: user.id,
            orgId: user.organizationId,
            email: user.email,
            role: user.role,
        });
        return res.json({ accessToken });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
async function me(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const user = await getAuthService().findUserById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.json({ user });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
async function getApiKeys(req, res) {
    try {
        if (!req.user || !req.orgId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { getPrisma } = await Promise.resolve().then(() => __importStar(require('@/database/prisma')));
        const prisma = getPrisma();
        const apiKeys = await prisma.apiKey.findMany({
            where: { organizationId: req.orgId },
            select: {
                id: true,
                name: true,
                isActive: true,
                createdAt: true,
                key: false, // Don't return the full key for security
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.json({ apiKeys });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
async function createApiKey(req, res) {
    try {
        if (!req.user || !req.orgId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Only admins can create API keys' });
        }
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Missing required field: name' });
        }
        const { hashApiKey, generateApiKey } = await Promise.resolve().then(() => __importStar(require('@/utils/helpers')));
        const { getPrisma } = await Promise.resolve().then(() => __importStar(require('@/database/prisma')));
        const prisma = getPrisma();
        const apiKey = generateApiKey();
        const hashedKey = hashApiKey(apiKey);
        const createdKey = await prisma.apiKey.create({
            data: {
                key: hashedKey,
                name,
                organizationId: req.orgId,
            },
        });
        return res.status(201).json({
            id: createdKey.id,
            name: createdKey.name,
            key: apiKey, // Only return new key once
            isActive: createdKey.isActive,
            message: 'Save this key in a secure location. You will not see it again.',
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
async function toggleApiKey(req, res) {
    try {
        if (!req.user || !req.orgId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Only admins can manage API keys' });
        }
        const { id } = req.params;
        const { isActive } = req.body;
        const { getPrisma } = await Promise.resolve().then(() => __importStar(require('@/database/prisma')));
        const prisma = getPrisma();
        // Verify key belongs to org
        const key = await prisma.apiKey.findFirst({
            where: {
                id,
                organizationId: req.orgId,
            },
        });
        if (!key) {
            return res.status(404).json({ error: 'API key not found' });
        }
        const updated = await prisma.apiKey.update({
            where: { id },
            data: { isActive },
            select: {
                id: true,
                name: true,
                isActive: true,
            },
        });
        return res.json(updated);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
//# sourceMappingURL=auth.js.map