import { Request, Response } from 'express';
import { AuthService } from '@/services/auth';
import { generateAccessToken, generateRefreshToken } from '@/utils/helpers';

let authService: AuthService | null = null;

function getAuthService() {
  if (!authService) {
    authService = new AuthService();
  }
  return authService;
}

export async function register(req: Request, res: Response) {
  try {
    const { email, password, organizationName } = req.body;

    if (!email || !password || !organizationName) {
      return res.status(400).json({
        error: 'Missing required fields: email, password, organizationName',
      });
    }

    const result = await getAuthService().register(email, password, organizationName);

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

    const user = await getAuthService().login(email, password);

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

    const user = await getAuthService().findUserById(payload.userId);
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

    const user = await getAuthService().findUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getApiKeys(req: Request, res: Response) {
  try {
    if (!req.user || !req.orgId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { getPrisma } = await import('@/database/prisma');
    const prisma = getPrisma();

    const apiKeys = await prisma.apiKey.findMany({
      where: { organizationId: req.orgId },
      select: {
        id: true,
        name: true,
        isActive: true,
        createdAt: true,
        key: false, // Don't return the full key for security
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ apiKeys });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function createApiKey(req: Request, res: Response) {
  try {
    if (!req.user || !req.orgId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can create API keys' });
    }

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Missing required field: name' });
    }

    const { hashApiKey, generateApiKey } = await import('@/utils/helpers');
    const { getPrisma } = await import('@/database/prisma');
    const prisma = getPrisma();

    const apiKey = generateApiKey();
    const hashedKey = hashApiKey(apiKey);

    const createdKey = await prisma.apiKey.create({
      data: {
        key: hashedKey,
        name,
        organizationId: req.orgId,
      },
    });

    return res.status(201).json({
      id: createdKey.id,
      name: createdKey.name,
      key: apiKey, // Only return new key once
      isActive: createdKey.isActive,
      message: 'Save this key in a secure location. You will not see it again.',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function toggleApiKey(req: Request, res: Response) {
  try {
    if (!req.user || !req.orgId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can manage API keys' });
    }

    const { id } = req.params;
    const { isActive } = req.body;

    const { getPrisma } = await import('@/database/prisma');
    const prisma = getPrisma();

    // Verify key belongs to org
    const key = await prisma.apiKey.findFirst({
      where: {
        id,
        organizationId: req.orgId,
      },
    });

    if (!key) {
      return res.status(404).json({ error: 'API key not found' });
    }

    const updated = await prisma.apiKey.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });

    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
