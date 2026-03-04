"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envConfig = void 0;
function getEnv(key, defaultValue) {
    const value = process.env[key];
    if (!value && defaultValue === undefined) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value || defaultValue;
}
function getEnvNumber(key, defaultValue) {
    const value = process.env[key];
    if (!value && defaultValue === undefined) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value ? parseInt(value, 10) : defaultValue;
}
function getEnvArray(key, defaultValue) {
    const value = process.env[key];
    if (!value && defaultValue === undefined) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value ? value.split(',') : defaultValue;
}
exports.envConfig = {
    // Database
    databaseUrl: getEnv('DATABASE_URL'),
    // Redis
    redisUrl: getEnv('REDIS_URL'),
    // JWT
    jwtSecret: getEnv('JWT_SECRET'),
    jwtExpiresIn: getEnv('JWT_EXPIRES_IN', '15m'),
    refreshTokenSecret: getEnv('REFRESH_TOKEN_SECRET'),
    refreshTokenExpiresIn: getEnv('REFRESH_TOKEN_EXPIRES_IN', '7d'),
    // API
    apiPort: getEnvNumber('API_PORT', 3000),
    apiHost: getEnv('API_HOST', '0.0.0.0'),
    nodeEnv: getEnv('NODE_ENV', 'development'),
    // CORS
    corsOrigins: getEnvArray('CORS_ORIGINS', ['http://localhost:3001']),
    // Rate Limiting
    rateLimitWindowMs: getEnvNumber('RATE_LIMIT_WINDOW_MS', 900000),
    rateLimitMaxRequests: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),
    // Agent Config
    agentHeartbeatInterval: getEnvNumber('AGENT_HEARTBEAT_INTERVAL', 30000),
    agentOfflineThreshold: getEnvNumber('AGENT_OFFLINE_THRESHOLD', 120000),
    // Alert Thresholds
    alertCpuThreshold: getEnvNumber('ALERT_CPU_THRESHOLD', 85),
    alertRamThreshold: getEnvNumber('ALERT_RAM_THRESHOLD', 90),
    alertDiskThreshold: getEnvNumber('ALERT_DISK_THRESHOLD', 95),
    // Security
    bcryptRounds: getEnvNumber('BCRYPT_ROUNDS', 10),
    apiKeyLength: getEnvNumber('API_KEY_LENGTH', 32),
};
//# sourceMappingURL=env.js.map