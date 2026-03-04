import { getPrisma } from '@/database/prisma';
import { getRedisClient } from '@/config/redis';
import { envConfig } from '@/config/env';
import { AppError } from '@/utils/helpers';

const AlertType = {
  CPU_HIGH: 'CPU_HIGH',
  RAM_HIGH: 'RAM_HIGH',
  DISK_HIGH: 'DISK_HIGH',
  DEVICE_OFFLINE: 'DEVICE_OFFLINE',
  DEVICE_ONLINE: 'DEVICE_ONLINE',
} as const;

const AlertSeverity = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL',
} as const;

type AlertType = typeof AlertType[keyof typeof AlertType];
type AlertSeverity = typeof AlertSeverity[keyof typeof AlertSeverity];

export class DeviceService {
  private prisma = getPrisma();
  private redis = getRedisClient();

  async registerDevice(deviceId: string, orgId: string, osVersion?: string) {
    // Check if device already exists
    const existing = await this.prisma.device.findUnique({
      where: { deviceId },
    });

    if (existing && existing.organizationId !== orgId) {
      throw new AppError(409, 'Device already registered to another organization');
    }

    if (existing) {
      return existing;
    }

    // Create new device
    const device = await this.prisma.device.create({
      data: {
        deviceId,
        name: `Device ${deviceId.slice(0, 8)}`,
        osVersion,
        organizationId: orgId,
        isOnline: true,
        lastSeen: new Date(),
      },
    });

    return device;
  }

  async recordHeartbeat(
    deviceId: string,
    orgId: string,
    cpu: number,
    ram: number,
    disk: number,
    osVersion?: string
  ) {
    // Register device if not exists
    const device = await this.registerDevice(deviceId, orgId, osVersion);

    // Validate org ownership
    if (device.organizationId !== orgId) {
      throw new AppError(403, 'Device does not belong to this organization');
    }

    // Save metrics
    await this.prisma.deviceMetrics.create({
      data: {
        cpu,
        ram,
        disk,
        deviceId: device.id,
        orgId,
        timestamp: new Date(),
      },
    });

    // Update device status
    const wasOffline = !device.isOnline;
    await this.prisma.device.update({
      where: { id: device.id },
      data: {
        isOnline: true,
        lastSeen: new Date(),
      },
    });

    // Cache last metrics in Redis for quick access
    const cacheKey = `metrics:${deviceId}`;
    await this.redis.setEx(
      cacheKey,
      60, // 60 seconds TTL
      JSON.stringify({ cpu, ram, disk, timestamp: new Date().toISOString() })
    );

    // Create alerts if thresholds exceeded
    await this.checkAndCreateAlerts(device.id, orgId, cpu, ram, disk);

    // If device was offline, create online alert
    if (wasOffline) {
      await this.createAlert(
        device.id,
        orgId,
        AlertType.DEVICE_ONLINE,
        AlertSeverity.INFO,
        `Device ${device.name} is now online`
      );
    }

    return device;
  }

  async checkAndCreateAlerts(
    deviceId: string,
    orgId: string,
    cpu: number,
    ram: number,
    disk: number
  ) {
    if (cpu > envConfig.alertCpuThreshold) {
      await this.createAlert(
        deviceId,
        orgId,
        AlertType.CPU_HIGH,
        AlertSeverity.WARNING,
        `High CPU usage: ${cpu.toFixed(1)}%`
      );
    }

    if (ram > envConfig.alertRamThreshold) {
      await this.createAlert(
        deviceId,
        orgId,
        AlertType.RAM_HIGH,
        AlertSeverity.WARNING,
        `High RAM usage: ${ram.toFixed(1)}%`
      );
    }

    if (disk > envConfig.alertDiskThreshold) {
      await this.createAlert(
        deviceId,
        orgId,
        AlertType.DISK_HIGH,
        AlertSeverity.CRITICAL,
        `High disk usage: ${disk.toFixed(1)}%`
      );
    }
  }

  async createAlert(
    deviceId: string,
    orgId: string,
    type: AlertType,
    severity: AlertSeverity,
    message: string
  ) {
    // Check if similar unresolved alert exists in last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existing = await this.prisma.alert.findFirst({
      where: {
        deviceId,
        orgId,
        type,
        isResolved: false,
        createdAt: {
          gte: fiveMinutesAgo,
        },
      },
    });

    if (existing) {
      return existing; // Don't create duplicate alerts
    }

    const alert = await this.prisma.alert.create({
      data: {
        type,
        severity,
        message,
        deviceId,
        orgId,
      },
    });

    // Publish alert via Redis for WebSocket broadcast
    await this.redis.publish(
      `alerts:${orgId}`,
      JSON.stringify({
        event: 'alert:created',
        data: alert,
      })
    );

    return alert;
  }

  async getDevices(orgId: string, skip: number, take: number) {
    const [devices, total] = await Promise.all([
      this.prisma.device.findMany({
        where: { organizationId: orgId },
        include: {
          metrics: {
            orderBy: { timestamp: 'desc' },
            take: 1,
          },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.device.count({
        where: { organizationId: orgId },
      }),
    ]);

    return { devices, total };
  }

  async getDeviceById(deviceId: string, orgId: string) {
    const device = await this.prisma.device.findUnique({
      where: { id: deviceId },
      include: {
        metrics: {
          orderBy: { timestamp: 'desc' },
          take: 100, // Last 100 metrics
        },
      },
    });

    if (!device) {
      throw new AppError(404, 'Device not found');
    }

    if (device.organizationId !== orgId) {
      throw new AppError(403, 'Device does not belong to this organization');
    }

    return device;
  }

  async deleteDevice(deviceId: string, orgId: string) {
    const device = await this.prisma.device.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new AppError(404, 'Device not found');
    }

    if (device.organizationId !== orgId) {
      throw new AppError(403, 'Device does not belong to this organization');
    }

    return this.prisma.device.delete({
      where: { id: deviceId },
    });
  }

  async getDeviceStats(orgId: string) {
    const [total, online] = await Promise.all([
      this.prisma.device.count({
        where: { organizationId: orgId },
      }),
      this.prisma.device.count({
        where: { organizationId: orgId, isOnline: true },
      }),
    ]);

    return {
      total,
      online,
      offline: total - online,
    };
  }
}
