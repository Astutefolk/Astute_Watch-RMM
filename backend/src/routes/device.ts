import express from 'express';
import * as deviceController from '@/controllers/device';
import { authMiddleware, apiKeyMiddleware } from '@/middleware/auth';
import { agentLimiter } from '@/middleware/rateLimit';

const router = express.Router();

// Device registration (for agents)
router.post(
  '/register',
  apiKeyMiddleware,
  agentLimiter,
  deviceController.registerAgent
);

// Device metrics (for agents)
router.post(
  '/heartbeat',
  apiKeyMiddleware,
  agentLimiter,
  deviceController.heartbeat
);

// Device management (for dashboard)
router.get('/stats', authMiddleware, deviceController.getStats);
router.get('/dashboard', authMiddleware, deviceController.getDashboard);
router.get('/', authMiddleware, deviceController.getDevices);
router.get('/:id', authMiddleware, deviceController.getDevice);
router.delete('/:id', authMiddleware, deviceController.deleteDevice);

export default router;
