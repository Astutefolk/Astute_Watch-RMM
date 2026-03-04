import { Request, Response } from 'express';
import { AuthService } from '@/services/auth';
import { generateAccessToken, generateRefreshToken } from '@/utils/helpers';

const authService = new AuthService();

export async function register(req: Request, res: Response) {
  try {
    const { email, password, organizationName } = req.body;

    if (!email || !password || !organizationName) {
      return res.status(400).json({
        error: 'Missing required fields: email, password, organizationName',
      });
    }

    const result = await authService.register(email, password, organizationName);

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: result.userId,
      orgId: result.orgId,
      email: result.email,
      role: 'ADMIN',
    });

    const refreshToken = generateRefreshToken(result.userId);

    return res.status(201).json({
      accessToken,
      refreshToken,
      user: {
        userId: result.userId,
        email: result.email,
        orgId: result.orgId,
      },
      apiKey: result.apiKey,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ error: error.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields: email, password',
      });
    }

    const user = await authService.login(email, password);

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.userId,
      orgId: user.orgId,
      email: user.email,
      role: user.role as any,
    });

    const refreshToken = generateRefreshToken(user.userId);

    return res.json({
      accessToken,
      refreshToken,
      user: {
        userId: user.userId,
        email: user.email,
        orgId: user.orgId,
        role: user.role,
      },
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ error: error.message });
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Missing refreshToken' });
    }

    const { verifyRefreshToken } = await import('@/utils/helpers');
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    const user = await authService.findUserById(payload.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: user.id,
      orgId: user.organizationId,
      email: user.email,
      role: user.role as any,
    });

    return res.json({ accessToken });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function me(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await authService.findUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
