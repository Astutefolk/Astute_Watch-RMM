import Device from '@/models/Device';

export class DeviceService {
  async createDevice(organizationId: string, name: string, hostname?: string) {
    return await Device.create({
      organizationId,
      name,
      hostname,
      status: 'OFFLINE',
    });
  }

  async getDevices(organizationId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [devices, total] = await Promise.all([
      Device.find({ organizationId }).skip(skip).limit(limit).lean(),
      Device.countDocuments({ organizationId }),
    ]);
    return { devices, total, page, limit };
  }

  async getDevice(deviceId: string, organizationId: string) {
    return await Device.findOne({ _id: deviceId, organizationId }).lean();
  }

  async updateDeviceStatus(deviceId: string, status: 'ONLINE' | 'OFFLINE' | 'ERROR') {
    return await Device.findByIdAndUpdate(
      deviceId,
      { status, lastSeen: new Date() },
      { new: true }
    ).lean();
  }

  async updateDeviceMetrics(deviceId: string, cpuUsage: number, memoryUsage: number) {
    return await Device.findByIdAndUpdate(
      deviceId,
      { cpuUsage, memoryUsage, lastSeen: new Date() },
      { new: true }
    ).lean();
  }

  async deleteDevice(deviceId: string) {
    return await Device.findByIdAndDelete(deviceId).lean();
  }

  async getDashboard(organizationId: string) {
    const devices = await Device.find({ organizationId }).lean();
    const online = devices.filter((d) => d.status === 'ONLINE').length;
    const offline = devices.filter((d) => d.status === 'OFFLINE').length;
    const avgCpu = devices.length > 0
      ? devices.reduce((sum, d) => sum + (d.cpuUsage || 0), 0) / devices.length
      : 0;
    const avgMemory = devices.length > 0
      ? devices.reduce((sum, d) => sum + (d.memoryUsage || 0), 0) / devices.length
      : 0;

    return { totalDevices: devices.length, online, offline, avgCpu, avgMemory };
  }

  async getStats(organizationId: string) {
    const devices = await Device.find({ organizationId }).lean();
    return {
      total: devices.length,
      online: devices.filter((d) => d.status === 'ONLINE').length,
      offline: devices.filter((d) => d.status === 'OFFLINE').length,
      error: devices.filter((d) => d.status === 'ERROR').length,
    };
  }
}

export const deviceService = new DeviceService();
