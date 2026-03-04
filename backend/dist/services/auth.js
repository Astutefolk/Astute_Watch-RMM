"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma_1 = require("@/database/prisma");
const redis_1 = require("@/config/redis");
const helpers_1 = require("@/utils/helpers");
class AuthService {
    constructor() {
        this.prisma = (0, prisma_1.getPrisma)();
        this.redis = null;
    }
    getRedis() {
        if (!this.redis) {
            this.redis = (0, redis_1.getRedisClient)();
        }
        return this.redis;
    }
    async register(email, password, organizationName) {
        // Validate input
        if (!(0, helpers_1.isValidEmail)(email)) {
            throw new helpers_1.AppError(400, 'Invalid email format');
        }
        const passwordValidation = (0, helpers_1.validatePassword)(password);
        if (!passwordValidation.valid) {
            throw new helpers_1.AppError(400, passwordValidation.errors.join(', '));
        }
        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new helpers_1.AppError(409, 'Email already registered');
        }
        // Create organization
        const org = await this.prisma.organization.create({
            data: {
                name: organizationName,
            },
        });
        // Hash password
        const passwordHash = await (0, helpers_1.hashPassword)(password);
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
        const apiKey = (0, helpers_1.generateApiKey)();
        const hashedApiKey = (0, helpers_1.hashApiKey)(apiKey);
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
    async login(email, password) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                orgId: {
                    select: { id: true, name: true },
                },
            },
        });
        if (!user) {
            throw new helpers_1.AppError(401, 'Invalid email or password');
        }
        // Compare passwords
        const isPasswordValid = await (0, helpers_1.comparePasswords)(password, user.password);
        if (!isPasswordValid) {
            throw new helpers_1.AppError(401, 'Invalid email or password');
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
    async findUserById(userId) {
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
    async validateApiKey(apiKey) {
        const hashedKey = (0, helpers_1.hashApiKey)(apiKey);
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
exports.AuthService = AuthService;
//# sourceMappingURL=auth.js.map