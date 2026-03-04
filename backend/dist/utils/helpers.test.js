"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../utils/helpers");
describe('Helper Functions', () => {
    describe('Password Hashing', () => {
        it('should hash password', async () => {
            const password = 'TestPassword123!';
            const hash = await (0, helpers_1.hashPassword)(password);
            expect(hash).not.toBe(password);
            expect(hash.length).toBeGreaterThan(20);
        });
        it('should compare password with hash correctly', async () => {
            const password = 'TestPassword123!';
            const hash = await (0, helpers_1.hashPassword)(password);
            const isValid = await (0, helpers_1.comparePasswords)(password, hash);
            expect(isValid).toBe(true);
        });
        it('should reject incorrect password', async () => {
            const password = 'TestPassword123!';
            const hash = await (0, helpers_1.hashPassword)(password);
            const isValid = await (0, helpers_1.comparePasswords)('WrongPassword', hash);
            expect(isValid).toBe(false);
        });
    });
    describe('API Key Generation', () => {
        it('should generate unique API keys', () => {
            const key1 = (0, helpers_1.generateApiKey)();
            const key2 = (0, helpers_1.generateApiKey)();
            expect(key1).not.toBe(key2);
            expect(key1.startsWith('key_')).toBe(true);
            expect(key2.startsWith('key_')).toBe(true);
        });
        it('should hash API key consistently', () => {
            const key = (0, helpers_1.generateApiKey)();
            const hash1 = (0, helpers_1.hashApiKey)(key);
            const hash2 = (0, helpers_1.hashApiKey)(key);
            expect(hash1).toBe(hash2);
            expect(hash1.length).toBe(64); // SHA256 hex is 64 chars
        });
        it('should generate different hashes for different keys', () => {
            const key1 = (0, helpers_1.generateApiKey)();
            const key2 = (0, helpers_1.generateApiKey)();
            const hash1 = (0, helpers_1.hashApiKey)(key1);
            const hash2 = (0, helpers_1.hashApiKey)(key2);
            expect(hash1).not.toBe(hash2);
        });
    });
    describe('Email Validation', () => {
        it('should validate correct email', () => {
            expect((0, helpers_1.isValidEmail)('test@example.com')).toBe(true);
            expect((0, helpers_1.isValidEmail)('user.name@domain.co.uk')).toBe(true);
        });
        it('should reject invalid email', () => {
            expect((0, helpers_1.isValidEmail)('invalid-email')).toBe(false);
            expect((0, helpers_1.isValidEmail)('@example.com')).toBe(false);
            expect((0, helpers_1.isValidEmail)('test@')).toBe(false);
        });
    });
    describe('Password Validation', () => {
        it('should validate strong password', () => {
            const result = (0, helpers_1.validatePassword)('StrongPass123!');
            expect(result.valid).toBe(true);
            expect(result.errors.length).toBe(0);
        });
        it('should reject too short password', () => {
            const result = (0, helpers_1.validatePassword)('Short1!');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Password must be at least 8 characters');
        });
        it('should reject password without uppercase', () => {
            const result = (0, helpers_1.validatePassword)('lowercase123!');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Password must contain at least one uppercase letter');
        });
        it('should reject password without lowercase', () => {
            const result = (0, helpers_1.validatePassword)('UPPERCASE123!');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Password must contain at least one lowercase letter');
        });
        it('should reject password without number', () => {
            const result = (0, helpers_1.validatePassword)('NoNumber!');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Password must contain at least one number');
        });
        it('should allow multiple validation errors', () => {
            const result = (0, helpers_1.validatePassword)('weak');
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(1);
        });
    });
});
//# sourceMappingURL=helpers.test.js.map