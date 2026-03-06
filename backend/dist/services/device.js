"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deviceService = exports.DeviceService = void 0;
const Device_1 = __importDefault(require("@/models/Device"));
class DeviceService {
    async createDevice(organizationId, name, hostname) {
        return await Device_1.default.create({
            organizationId,
            name,
            hostname,
            status: 'OFFLINE',
        });
    }
    async getDevices(organizationId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [devices, total] = await Promise.all([
            Device_1.default.find({ organizationId }).skip(skip).limit(limit).lean(),
            Device_1.default.countDocuments({ organizationId }),
        ]);
        return { devices, total, page, limit };
    }
    async getDevice(deviceId, organizationId) {
        return await Device_1.default.findOne({ _id: deviceId, organizationId }).lean();
    }
    async updateDeviceStatus(deviceId, status) {
        return await Device_1.default.findByIdAndUpdate(deviceId, { status, lastSeen: new Date() }, { new: true }).lean();
    }
    async updateDeviceMetrics(deviceId, cpuUsage, memoryUsage) {
        return await Device_1.default.findByIdAndUpdate(deviceId, { cpuUsage, memoryUsage, lastSeen: new Date() }, { new: true }).lean();
    }
    async deleteDevice(deviceId) {
        return await Device_1.default.findByIdAndDelete(deviceId).lean();
    }
    async getDashboard(organizationId) {
        const devices = await Device_1.default.find({ organizationId }).lean();
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
    async getStats(organizationId) {
        const devices = await Device_1.default.find({ organizationId }).lean();
        return {
            total: devices.length,
            online: devices.filter((d) => d.status === 'ONLINE').length,
            offline: devices.filter((d) => d.status === 'OFFLINE').length,
            error: devices.filter((d) => d.status === 'ERROR').length,
        };
    }
}
exports.DeviceService = DeviceService;
exports.deviceService = new DeviceService();
//# sourceMappingURL=device.js.map