import { getPrisma } from '@/database/prisma';
import { getRedisClient } from '@/config/redis';
import {
  hashPassword,
  comparePasswords,
  hashApiKey,
  generateApiKey,
  isValidEmail,
  validatePassword,
  AppError,
} from '@/utils/helpers';

export class AuthService {
  private prisma = getPrisma();
  private redis: ReturnType<typeof getRedisClient> | null = null;

  private getRedis() {
    if (!this.redis) {
      this.redis = getRedisClient();
    }
    return this.redis;
  }

  async register(email: string, password: string, organizationName: string) {
    // Validate input
    if (!isValidEmail(email)) {
      throw new AppError(400, 'Invalid email format');
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      throw new AppError(400, passwordValidation.errors.join(', '));
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError(409, 'Email already registered');
    }

    // Create organization
    const org = await this.prisma.organization.create({
      data: {
        name: organizationName,
      },
    });

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: passwordHash,
        role: 'ADMIN', // First user is admin
        organizationId: org.id,
      },
    });

    // Generate API key for organization
    const apiKey = generateApiKey();
    const hashedApiKey = hashApiKey(apiKey);

    await this.prisma.apiKey.create({
      data: {
        key: hashedApiKey,
        name: 'Default API Key',
        organizationId: org.id,
      },
    });

    return {
      userId: user.id,
      orgId: org.id,
      email: user.email,
      apiKey: apiKey, // Only return once on creation
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        orgId: {
          select: { id: true, name: true },
        },
      },
    });

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Compare passwords
    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Cache user session in Redis
    const sessionKey = `session:${user.id}`;
    await this.getRedis().setEx(sessionKey, 7 * 24 * 60 * 60, JSON.stringify({
      userId: user.id,
      email: user.email,
      orgId: user.organizationId,
      role: user.role,
    }));

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      orgId: user.organizationId,
    };
  }

  async findUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        organizationId: true,
      },
    });
  }

  async validateApiKey(apiKey: string) {
    const hashedKey = hashApiKey(apiKey);
    const key = await this.prisma.apiKey.findUnique({
      where: { key: hashedKey },
      include: {
        orgId: {
          select: { id: true },
        },
      },
    });

    if (!key || !key.isActive) {
      return null;
    }

    return key;
  }
}
