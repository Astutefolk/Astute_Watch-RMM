import { Request, Response } from 'express';
import { AlertService } from '@/services/alert';
import { getPaginationParams } from '@/utils/helpers';

const alertService = new AlertService();

export async function getAlerts(req: Request, res: Response) {
  try {
    if (!req.user || !req.orgId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { page, limit, unresolved } = req.query;
    const { skip, take } = getPaginationParams(page as string, limit as string);

    const { alerts, total } = await alertService.getAlerts(
      req.orgId,
      skip,
      take,
      unresolved === 'true'
    );

    res.json({
      alerts,
      pagination: {
        total,
        page: Math.floor(skip / take) + 1,
        limit: take,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAlert(req: Request, res: Response) {
  try {
    if (!req.user || !req.orgId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const alert = await alertService.getAlertById(id, req.orgId);

    res.json(alert);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
}

export async function resolveAlert(req: Request, res: Response) {
  try {
    if (!req.user || !req.orgId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const alert = await alertService.resolveAlert(id, req.orgId);

    res.json(alert);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
}

export async function getStats(req: Request, res: Response) {
  try {
    if (!req.user || !req.orgId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const stats = await alertService.getStats(req.orgId);

    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
