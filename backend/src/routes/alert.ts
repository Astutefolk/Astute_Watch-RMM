import express from 'express';
import * as alertController from '@/controllers/alert';
import { authMiddleware } from '@/middleware/auth';

const router = express.Router();

router.get('/stats', authMiddleware, alertController.getStats);
router.get('/', authMiddleware, alertController.getAlerts);
router.get('/:id', authMiddleware, alertController.getAlert);
router.patch('/:id/resolve', authMiddleware, alertController.resolveAlert);

export default router;
