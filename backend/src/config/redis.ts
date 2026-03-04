import { createClient } from 'redis';
import { envConfig } from './env';

let redisClient: ReturnType<typeof createClient> | null = null;

export async function initRedis() {
  try {
    redisClient = createClient({
      url: envConfig.redisUrl,
    });

    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    redisClient.on('connect', () => console.log('Redis connected'));

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    throw error;
  }
}

export function getRedisClient() {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
}

export async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
  }
}
