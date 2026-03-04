"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRedisLimiter = exports.agentLimiter = exports.authLimiter = exports.globalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const redis_1 = require("@/config/redis");
const env_1 = require("@/config/env");
let RedisStore;
try {
    // Optional dependency; fallback to in-memory limiter if unavailable
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    RedisStore = require('rate-limit-redis');
}
catch {
    RedisStore = null;
}
exports.globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.envConfig.rateLimitWindowMs,
    max: env_1.envConfig.rateLimitMaxRequests,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: 'Too many login attempts, please try again later.',
    skipSuccessfulRequests: true,
});
exports.agentLimiter = (0, express_rate_limit_1.default)({
    windowMs: 10 * 1000, // 10 seconds
    max: 1, // 1 heartbeat per 10 seconds per IP
    message: 'Agent heartbeat rate limit exceeded',
    keyGenerator: (req) => {
        // Use device ID if available, otherwise use IP
        return req.body?.deviceId || req.ip || 'unknown';
    },
});
const createRedisLimiter = () => {
    try {
        const redisClient = (0, redis_1.getRedisClient)();
        if (!RedisStore) {
            return exports.globalLimiter;
        }
        return (0, express_rate_limit_1.default)({
            store: new RedisStore({
                client: redisClient,
                prefix: 'rate-limit:',
            }),
            windowMs: env_1.envConfig.rateLimitWindowMs,
            max: env_1.envConfig.rateLimitMaxRequests,
            message: 'Too many requests from this IP, please try again later.',
        });
    }
    catch {
        // Fallback to in-memory limiter if Redis is not available
        return exports.globalLimiter;
    }
};
exports.createRedisLimiter = createRedisLimiter;
//# sourceMappingURL=rateLimit.js.map