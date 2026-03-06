import User from '@/models/User';
import Organization from '@/models/Organization';
import ApiKey from '@/models/ApiKey';
import { hashPassword, comparePasswords, hashApiKey, generateApiKey } from '@/utils/helpers';

export class AuthService {
  async register(email: string, password: string, organizationName: string) {
    // Create organization
    const org = await Organization.create({ name: organizationName });

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      organizationId: org._id,
      role: 'ADMIN',
    });

    // Generate API key
    const apiKey = generateApiKey();
    const hashedApiKey = hashApiKey(apiKey);

    await ApiKey.create({
      organizationId: org._id,
      name: 'Default API Key',
      key: hashedApiKey,
    });

    return {
      userId: user._id,
      orgId: org._id,
      email: user.email,
      apiKey: apiKey,
    };
  }

  async login(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValid = await comparePasswords(password, user.password);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    return {
      userId: user._id,
      email: user.email,
      role: user.role,
      orgId: user.organizationId,
    };
  }

  async findUserById(userId: string) {
    return await User.findById(userId).select('-password').lean();
  }

  async validateApiKey(apiKey: string) {
    const hashedKey = hashApiKey(apiKey);
    return await ApiKey.findOne({ key: hashedKey, isActive: true }).lean();
  }

  async createApiKey(organizationId: string, name: string) {
    const apiKey = generateApiKey();
    const hashedKey = hashApiKey(apiKey);

    const created = await ApiKey.create({
      organizationId,
      name,
      key: hashedKey,
    });

    return {
      id: created._id,
      name: created.name,
      key: apiKey,
      isActive: created.isActive,
    };
  }

  async getApiKeys(organizationId: string) {
    return await ApiKey.find({ organizationId }).select('-key').lean();
  }

  async toggleApiKey(apiKeyId: string, isActive: boolean) {
    return await ApiKey.findByIdAndUpdate(apiKeyId, { isActive }, { new: true }).lean();
  }
}

export const authService = new AuthService();