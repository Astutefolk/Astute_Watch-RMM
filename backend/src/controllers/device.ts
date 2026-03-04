import { Request, Response } from 'express';
import { DeviceService } from '@/services/device';
import { getPaginationParams } from '@/utils/helpers';
import { hashApiKey } from '@/utils/helpers';
import { getPrisma } from '@/database/prisma';

const deviceService = new DeviceService();
const prisma = getPrisma();

export async function heartbeat(req: Request, res: Response) {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    const { deviceId, cpu, ram, disk, osVersion } = req.body;

    if (!deviceId || cpu === undefined || ram === undefined || disk === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: deviceId, cpu, ram, disk',
      });
    }

    // Validate API key and get organization
    const authService = new (await import('@/services/auth')).AuthService();
    const apiKeyRecord = await authService.validateApiKey(apiKey);

    if (!apiKeyRecord) {
      return res.status(401).json({ error: 'Invalid or inactive API key' });
    }

    // Record heartbeat
    const device = await deviceService.recordHeartbeat(
      deviceId,
      apiKeyRecord.organizationId,
      cpu,
      ram,
      disk,
      osVersion
    );

    res.json({
      deviceId: device.deviceId,
      deviceDbId: device.id,
      nextHeartbeatInterval: 30000,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
}

export async function getDevices(req: Request, res: Response) {
  try {
    if (!req.user || !req.orgId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { page, limit } = req.query;
    const { skip, take } = getPaginationParams(page as string, limit as string);

    const { devices, total } = await deviceService.getDevices(req.orgId, skip, take);

    res.json({
      devices,
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

export async function getDevice(req: Request, res: Response) {
  try {
    if (!req.user || !req.orgId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const device = await deviceService.getDeviceById(id, req.orgId);

    res.json(device);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
}

export async function deleteDevice(req: Request, res: Response) {
  try {
    if (!req.user || !req.orgId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can delete devices' });
    }

    const { id } = req.params;
    const device = await deviceService.deleteDevice(id, req.orgId);

    res.json({ message: 'Device deleted', device });
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

    const stats = await deviceService.getDeviceStats(req.orgId);

    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getDashboard(req: Request, res: Response) {
  try {
    if (!req.user || !req.orgId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [deviceStats, recentAlerts, alertStats] = await Promise.all([
      deviceService.getDeviceStats(req.orgId),
      prisma.alert.findMany({
        where: { orgId: req.orgId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          device: {
            select: { name: true },
          },
        },
      }),
      prisma.alert.count({
        where: {
          orgId: req.orgId,
          severity: 'CRITICAL',
          isResolved: false,
        },
      }),
    ]);

    res.json({
      stats: {
        totalDevices: deviceStats.total,
        onlineDevices: deviceStats.online,
        offlineDevices: deviceStats.offline,
        criticalAlerts: alertStats,
      },
      recentAlerts,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
