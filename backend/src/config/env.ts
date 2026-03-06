export interface EnvConfig {
  // Database
  mongodbUri: string;
  
  // Redis
  redisUrl: string;
  
  // JWT
  jwtSecret: string;
  jwtExpiresIn: string;
  refreshTokenSecret: string;
  refreshTokenExpiresIn: string;
  
  // API
  apiPort: number;
  apiHost: string;
  nodeEnv: 'development' | 'production' | 'test';
  
  // CORS
  corsOrigins: string[];
  
  // Rate Limiting
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  
  // Agent Config
  agentHeartbeatInterval: number;
  agentOfflineThreshold: number;
  
  // Alert Thresholds
  alertCpuThreshold: number;
  alertRamThreshold: number;
  alertDiskThreshold: number;
  
  // Security
  bcryptRounds: number;
  apiKeyLength: number;
}

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue!;
}

function getEnvNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ? parseInt(value, 10) : defaultValue!;
}

function getEnvArray(key: string, defaultValue?: string[]): string[] {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ? value.split(',') : defaultValue!;
}

export const envConfig: EnvConfig = {
  // Database
  mongodbUri: getEnv('MONGODB_URI', 'mongodb://localhost:27017/datto'),
  
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
  nodeEnv: (getEnv('NODE_ENV', 'development') as any),
  
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
