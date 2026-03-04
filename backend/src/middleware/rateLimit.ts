import rateLimit from 'express-rate-limit';
import { getRedisClient } from '@/config/redis';
import { envConfig } from '@/config/env';
let RedisStore: any;
try {
  // Optional dependency; fallback to in-memory limiter if unavailable
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  RedisStore = require('rate-limit-redis');
} catch {
  RedisStore = null;
}

export const globalLimiter = rateLimit({
  windowMs: envConfig.rateLimitWindowMs,
  max: envConfig.rateLimitMaxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

export const agentLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 1, // 1 heartbeat per 10 seconds per IP
  message: 'Agent heartbeat rate limit exceeded',
  keyGenerator: (req) => {
    // Use device ID if available, otherwise use IP
    return req.body?.deviceId || req.ip || 'unknown';
  },
});

export const createRedisLimiter = () => {
  try {
    const redisClient = getRedisClient();
    if (!RedisStore) {
      return globalLimiter;
    }
    return rateLimit({
      store: new RedisStore({
        client: redisClient as any,
        prefix: 'rate-limit:',
      }),
      windowMs: envConfig.rateLimitWindowMs,
      max: envConfig.rateLimitMaxRequests,
      message: 'Too many requests from this IP, please try again later.',
    });
  } catch {
    // Fallback to in-memory limiter if Redis is not available
    return globalLimiter;
  }
};
