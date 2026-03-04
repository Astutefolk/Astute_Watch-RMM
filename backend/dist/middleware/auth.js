"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.adminMiddleware = adminMiddleware;
exports.apiKeyMiddleware = apiKeyMiddleware;
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
const helpers_1 = require("@/utils/helpers");
function authMiddleware(req, res, next) {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid authorization header' });
        }
        const token = authHeader.slice(7);
        const payload = (0, helpers_1.verifyAccessToken)(token);
        if (!payload) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        req.user = payload;
        req.orgId = payload.orgId;
        return next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
}
function adminMiddleware(req, res, next) {
    if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }
    return next();
}
function apiKeyMiddleware(req, res, next) {
    try {
        const apiKey = req.headers['x-api-key'];
        if (!apiKey) {
            return res.status(401).json({ error: 'Missing API key' });
        }
        // Validate API key format
        if (!apiKey.startsWith('key_')) {
            return res.status(401).json({ error: 'Invalid API key format' });
        }
        // Store for use in controller
        req.headers['x-api-key'] = apiKey;
        return next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Invalid API key' });
    }
}
function errorHandler(err, _req, res, _next) {
    console.error('Error:', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    return res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
}
function notFoundHandler(req, res) {
    return res.status(404).json({
        error: 'Endpoint not found',
        path: req.path,
    });
}
//# sourceMappingURL=auth.js.map