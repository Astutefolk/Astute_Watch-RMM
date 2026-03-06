import { Request, Response } from 'express';
import { alertService } from '@/services/alert';

export async function getAlerts(req: Request, res: Response) {
  try {
    if (!req.user || !req.orgId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { page = '1', limit = '10', unresolved } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;

    const { alerts, total } = await alertService.getAlerts(
      req.orgId,
      pageNum,
      limitNum,
      unresolved === 'true'
    );

    return res.json({
      alerts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getAlert(req: Request, res: Response) {
  try {
    if (!req.user || !req.orgId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const alert = await alertService.getAlert(id, req.orgId);

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    return res.json(alert);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function resolveAlert(req: Request, res: Response) {
  try {
    if (!req.user || !req.orgId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const alert = await alertService.resolveAlert(id);

    return res.json(alert);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getStats(req: Request, res: Response) {
  try {
    if (!req.user || !req.orgId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const stats = await alertService.getStats(req.orgId);

    return res.json(stats);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
