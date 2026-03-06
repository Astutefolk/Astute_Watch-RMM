import { Request, Response } from 'express';
import { authService } from '@/services/auth';
import { generateAccessToken, generateRefreshToken } from '@/utils/helpers';

export async function register(req: Request, res: Response) {
  try {
    const { email, password, organizationName } = req.body;

    if (!email || !password || !organizationName) {
      return res.status(400).json({
        error: 'Missing required fields: email, password, organizationName',
      });
    }

    const result = await authService.register(email, password, organizationName);

    const accessToken = generateAccessToken({
      userId: result.userId.toString(),
      orgId: result.orgId.toString(),
      email: result.email,
      role: 'ADMIN' as const,
    });

    const refreshToken = generateRefreshToken(result.userId.toString());

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
    return res.status(500).json({ error: error.message });
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

    const accessToken = generateAccessToken({
      userId: user.userId.toString(),
      orgId: user.orgId.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken(user.userId.toString());

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
    return res.status(500).json({ error: error.message });
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Missing refreshToken' });
    }

    const { verifyRefreshToken } = await import('@/utils/helpers');
    const payload = verifyRefreshToken(token);

    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    const user = await authService.findUserById(payload.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      orgId: user.organizationId.toString(),
      email: user.email,
      role: user.role,
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

export async function getApiKeys(req: Request, res: Response) {
  try {
    if (!req.user || !req.orgId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const apiKeys = await authService.getApiKeys(req.orgId);

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

    const createdKey = await authService.createApiKey(req.orgId, name);

    return res.status(201).json({
      id: createdKey.id,
      name: createdKey.name,
      key: createdKey.key,
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

    const updated = await authService.toggleApiKey(id, isActive);

    if (!updated) {
      return res.status(404).json({ error: 'API key not found' });
    }

    return res.json({
      id: updated._id,
      name: updated.name,
      isActive: updated.isActive,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
