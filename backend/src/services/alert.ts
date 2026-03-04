import { getPrisma } from '@/database/prisma';
import { AppError } from '@/utils/helpers';

export class AlertService {
  private prisma = getPrisma();

  async getAlerts(orgId: string, skip: number, take: number, unresolved?: boolean) {
    const where: any = { orgId };
    if (unresolved !== undefined) {
      where.isResolved = !unresolved;
    }

    const [alerts, total] = await Promise.all([
      this.prisma.alert.findMany({
        where,
        include: {
          device: {
            select: { name: true, deviceId: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.alert.count({ where }),
    ]);

    return { alerts, total };
  }

  async getAlertById(alertId: string, orgId: string) {
    const alert = await this.prisma.alert.findUnique({
      where: { id: alertId },
      include: {
        device: {
          select: { name: true, deviceId: true },
        },
      },
    });

    if (!alert) {
      throw new AppError(404, 'Alert not found');
    }

    if (alert.orgId !== orgId) {
      throw new AppError(403, 'Alert does not belong to this organization');
    }

    return alert;
  }

  async resolveAlert(alertId: string, orgId: string) {
    const alert = await this.getAlertById(alertId, orgId);

    return this.prisma.alert.update({
      where: { id: alertId },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
      },
    });
  }

  async getStats(orgId: string) {
    const [total, unresolved, critical] = await Promise.all([
      this.prisma.alert.count({
        where: { orgId },
      }),
      this.prisma.alert.count({
        where: { orgId, isResolved: false },
      }),
      this.prisma.alert.count({
        where: {
          orgId,
          severity: 'CRITICAL',
          isResolved: false,
        },
      }),
    ]);

    return { total, unresolved, critical };
  }
}
