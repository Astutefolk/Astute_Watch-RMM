"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initRedis = initRedis;
exports.getRedisClient = getRedisClient;
exports.closeRedis = closeRedis;
const redis_1 = require("redis");
const env_1 = require("./env");
let redisClient = null;
async function initRedis() {
    try {
        redisClient = (0, redis_1.createClient)({
            url: env_1.envConfig.redisUrl,
        });
        redisClient.on('error', (err) => console.log('Redis Client Error', err));
        redisClient.on('connect', () => console.log('Redis connected'));
        await redisClient.connect();
        return redisClient;
    }
    catch (error) {
        console.error('Failed to connect to Redis:', error);
        throw error;
    }
}
function getRedisClient() {
    if (!redisClient) {
        throw new Error('Redis client not initialized');
    }
    return redisClient;
}
async function closeRedis() {
    if (redisClient) {
        await redisClient.quit();
    }
}
//# sourceMappingURL=redis.js.map