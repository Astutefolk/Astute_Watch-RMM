import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { envConfig } from '@/config/env';
import { TokenPayload } from '@/types/index';

// ============ Password Hashing ============

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, envConfig.bcryptRounds);
}

export async function comparePasswords(
  password: string,
  hash: string
): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

// ============ JWT Token Management ============

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, envConfig.jwtSecret, {
    expiresIn: envConfig.jwtExpiresIn,
  } as any);
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, envConfig.refreshTokenSecret, {
    expiresIn: envConfig.refreshTokenExpiresIn,
  } as any);
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, envConfig.jwtSecret) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, envConfig.refreshTokenSecret) as {
      userId: string;
    };
  } catch {
    return null;
  }
}

// ============ API Key Generation ============

export function generateApiKey(): string {
  return `key_${crypto.randomBytes(envConfig.apiKeyLength).toString('hex')}`;
}

export function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

// ============ ID Generation ============

export function generateDeviceId(): string {
  return `dev_${crypto.randomBytes(12).toString('hex')}`;
}

// ============ Validation ============

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============ Pagination ============

export function getPaginationParams(
  page: string | undefined,
  limit: string | undefined
): { skip: number; take: number } {
  const pageNum = Math.max(1, parseInt(page || '1', 10));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit || '10', 10)));

  return {
    skip: (pageNum - 1) * limitNum,
    take: limitNum,
  };
}

// ============ Error Handling ============

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const ApiErrors = {
  INVALID_CREDENTIALS: new AppError(401, 'Invalid email or password'),
  UNAUTHORIZED: new AppError(401, 'Unauthorized'),
  FORBIDDEN: new AppError(403, 'Forbidden'),
  NOT_FOUND: new AppError(404, 'Resource not found'),
  CONFLICT: new AppError(409, 'Resource already exists'),
  VALIDATION_ERROR: (message: string) => new AppError(400, message),
  INTERNAL_ERROR: new AppError(500, 'Internal server error'),
};
