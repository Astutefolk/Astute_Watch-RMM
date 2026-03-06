"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const User_1 = __importDefault(require("@/models/User"));
const Organization_1 = __importDefault(require("@/models/Organization"));
const ApiKey_1 = __importDefault(require("@/models/ApiKey"));
const helpers_1 = require("@/utils/helpers");
class AuthService {
    async register(email, password, organizationName) {
        // Create organization
        const org = await Organization_1.default.create({ name: organizationName });
        // Hash password
        const hashedPassword = await (0, helpers_1.hashPassword)(password);
        // Create user
        const user = await User_1.default.create({
            email,
            password: hashedPassword,
            organizationId: org._id,
            role: 'ADMIN',
        });
        // Generate API key
        const apiKey = (0, helpers_1.generateApiKey)();
        const hashedApiKey = (0, helpers_1.hashApiKey)(apiKey);
        await ApiKey_1.default.create({
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
    async login(email, password) {
        const user = await User_1.default.findOne({ email });
        if (!user) {
            throw new Error('Invalid email or password');
        }
        const isValid = await (0, helpers_1.comparePasswords)(password, user.password);
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
    async findUserById(userId) {
        return await User_1.default.findById(userId).select('-password').lean();
    }
    async validateApiKey(apiKey) {
        const hashedKey = (0, helpers_1.hashApiKey)(apiKey);
        return await ApiKey_1.default.findOne({ key: hashedKey, isActive: true }).lean();
    }
    async createApiKey(organizationId, name) {
        const apiKey = (0, helpers_1.generateApiKey)();
        const hashedKey = (0, helpers_1.hashApiKey)(apiKey);
        const created = await ApiKey_1.default.create({
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
    async getApiKeys(organizationId) {
        return await ApiKey_1.default.find({ organizationId }).select('-key').lean();
    }
    async toggleApiKey(apiKeyId, isActive) {
        return await ApiKey_1.default.findByIdAndUpdate(apiKeyId, { isActive }, { new: true }).lean();
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.js.map