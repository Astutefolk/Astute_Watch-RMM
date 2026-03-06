export interface EnvConfig {
    mongodbUri: string;
    redisUrl: string;
    jwtSecret: string;
    jwtExpiresIn: string;
    refreshTokenSecret: string;
    refreshTokenExpiresIn: string;
    apiPort: number;
    apiHost: string;
    nodeEnv: 'development' | 'production' | 'test';
    corsOrigins: string[];
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
    agentHeartbeatInterval: number;
    agentOfflineThreshold: number;
    alertCpuThreshold: number;
    alertRamThreshold: number;
    alertDiskThreshold: number;
    bcryptRounds: number;
    apiKeyLength: number;
}
export declare const envConfig: EnvConfig;
//# sourceMappingURL=env.d.ts.map