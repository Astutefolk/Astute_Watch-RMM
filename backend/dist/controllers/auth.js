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
//# sourceMappingURL=auth.js.map