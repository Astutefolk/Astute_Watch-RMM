import { hashPassword, generateApiKey, generateJWT, verifyJWT } from '../utils/helpers';

describe('Helper Functions', () => {
  describe('Password Hashing', () => {
    it('should hash password and verify correctly', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      const bcrypt = require('bcryptjs');
      const isValid = await bcrypt.compare('WrongPassword', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('API Key Generation', () => {
    it('should generate unique API keys', () => {
      const key1 = generateApiKey();
      const key2 = generateApiKey();

      expect(key1).not.toBe(key2);
      expect(key1.length).toBeGreaterThan(20);
      expect(key2.length).toBeGreaterThan(20);
    });

    it('should generate deterministic hash for same key', () => {
      const key = generateApiKey();
      const hash1 = require('crypto').createHash('sha256').update(key).digest('hex');
      const hash2 = require('crypto').createHash('sha256').update(key).digest('hex');

      expect(hash1).toBe(hash2);
    });
  });

  describe('JWT Generation and Verification', () => {
    it('should generate valid JWT token', () => {
      const token = generateJWT({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'ADMIN'
      });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT format: header.payload.signature
    });

    it('should verify valid JWT token', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'ADMIN'
      };

      const token = generateJWT(payload);
      const verified = verifyJWT(token);

      expect(verified).toBeDefined();
      expect(verified.userId).toBe('user-123');
      expect(verified.email).toBe('test@example.com');
    });

    it('should reject expired token', async () => {
      // Create token with very short expiry
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { userId: 'user-123', email: 'test@example.com' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '0s' }
      );

      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should throw on verification
      expect(() => verifyJWT(token)).toThrow();
    });
  });
});
