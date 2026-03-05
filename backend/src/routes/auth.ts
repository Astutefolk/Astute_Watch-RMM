import express from 'express';
import * as authController from '@/controllers/auth';
import { authMiddleware } from '@/middleware/auth';
import { authLimiter } from '@/middleware/rateLimit';

const router = express.Router();

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.get('/me', authMiddleware, authController.me);

// API Key management
router.get('/api-keys', authMiddleware, authController.getApiKeys);
router.post('/api-keys', authMiddleware, authController.createApiKey);
router.patch('/api-keys/:id', authMiddleware, authController.toggleApiKey);

export default router;
