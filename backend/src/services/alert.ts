import Alert from '@/models/Alert';

export class AlertService {
  async createAlert(
    organizationId: string,
    title: string,
    message: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    deviceId?: string
  ) {
    return await Alert.create({
      organizationId,
      title,
      message,
      severity,
      deviceId,
      status: 'UNRESOLVED',
    });
  }

  async getAlerts(organizationId: string, page: number = 1, limit: number = 10, unresolved: boolean = false) {
    const skip = (page - 1) * limit;
    const query: any = { organizationId };
    if (unresolved) query.status = 'UNRESOLVED';

    const [alerts, total] = await Promise.all([
      Alert.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Alert.countDocuments(query),
    ]);
    return { alerts, total, page, limit };
  }

  async getAlert(alertId: string, organizationId: string) {
    return await Alert.findOne({ _id: alertId, organizationId }).lean();
  }

  async resolveAlert(alertId: string) {
    return await Alert.findByIdAndUpdate(
      alertId,
      { status: 'RESOLVED', resolvedAt: new Date() },
      { new: true }
    ).lean();
  }

  async getStats(organizationId: string) {
    const alerts = await Alert.find({ organizationId }).lean();
    const unresolved = alerts.filter((a) => a.status === 'UNRESOLVED').length;
    const critical = alerts.filter((a) => a.severity === 'CRITICAL').length;
    const high = alerts.filter((a) => a.severity === 'HIGH').length;

    return { total: alerts.length, unresolved, critical, high };
  }
}

export const alertService = new AlertService();
