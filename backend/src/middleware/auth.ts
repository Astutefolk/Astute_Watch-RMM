import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/utils/helpers';
import { getPrisma } from '@/database/prisma';
import { TokenPayload } from '@/types/index';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      orgId?: string;
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);

    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = payload;
    req.orgId = payload.orgId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

export function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden - Admin access required' });
  }
  next();
}

export function apiKeyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    if (!apiKey) {
      return res.status(401).json({ error: 'Missing API key' });
    }

    // Validate API key format
    if (!apiKey.startsWith('key_')) {
      return res.status(401).json({ error: 'Invalid API key format' });
    }

    // Store for use in controller
    req.headers['x-api-key'] = apiKey;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid API key' });
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
  });
}
