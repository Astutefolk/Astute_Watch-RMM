import express from 'express';
import * as authController from '@/controllers/auth';
import { authMiddleware } from '@/middleware/auth';
import { authLimiter } from '@/middleware/rateLimit';

const router = express.Router();

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.get('/me', authMiddleware, authController.me);

export default router;
