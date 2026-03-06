import { Request, Response } from 'express';
import { deviceService } from '@/services/device';
import { alertService } from '@/services/alert';
import { authService } from '@/services/auth';

export async function heartbeat(req: Request, res: Response) {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    const { deviceId, cpu, ram, disk } = req.body;

    if (!deviceId || cpu === undefined || ram === undefined || disk === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: deviceId, cpu, ram, disk',
      });
    }

    const apiKeyRecord = await authService.validateApiKey(apiKey);
    if (!apiKeyRecord) {
      return res.status(401).json({ error: 'Invalid or inactive API key' });
    }

    const device = await deviceService.updateDeviceMetrics(
      deviceId,
      cpu,
      ram
    );

    return res.json({
      deviceId,
      deviceDbId: device?._id,
      nextHeartbeatInterval: 30000,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getDevices(req: Request, res: Response) {
  try {
    if (!req.user || !req.orgId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;

    const { devices, total } = await deviceService.getDevices(req.orgId, pageNum, limitNum);

    return res.json({
      devices,
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

export async function getDevice(req: Request, res: Response) {
  try {
    if (!req.user || !req.orgId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const device = await deviceService.getDevice(id, req.orgId);

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    return res.json(device);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
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
    const device = await deviceService.deleteDevice(id);

    return res.json({ message: 'Device deleted', device });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function registerAgent(req: Request, res: Response) {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    const { deviceId, deviceName } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        error: 'Missing required field: deviceId',
      });
    }

    const apiKeyRecord = await authService.validateApiKey(apiKey);
    if (!apiKeyRecord) {
      return res.status(401).json({ error: 'Invalid or inactive API key' });
    }

    const device = await deviceService.createDevice(
      apiKeyRecord.organizationId.toString(),
      deviceName || `Device ${deviceId.slice(0, 8)}`,
      deviceId
    );

    return res.status(201).json({
      success: true,
      device: {
        id: device._id,
        deviceId: device.hostname,
        name: device.name,
        status: device.status,
      },
      message: 'Device registered successfully',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getStats(req: Request, res: Response) {
  try {
    if (!req.user || !req.orgId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const stats = await deviceService.getStats(req.orgId);

    return res.json(stats);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getDashboard(req: Request, res: Response) {
  try {
    if (!req.user || !req.orgId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [deviceStats, alertStats] = await Promise.all([
      deviceService.getDashboard(req.orgId),
      alertService.getStats(req.orgId),
    ]);

    return res.json({
      stats: {
        totalDevices: deviceStats.totalDevices,
        onlineDevices: deviceStats.online,
        offlineDevices: deviceStats.offline,
        criticalAlerts: alertStats.critical,
      },
      alertStats,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
