"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.heartbeat = heartbeat;
exports.getDevices = getDevices;
exports.getDevice = getDevice;
exports.deleteDevice = deleteDevice;
exports.registerAgent = registerAgent;
exports.getStats = getStats;
exports.getDashboard = getDashboard;
const device_1 = require("@/services/device");
const alert_1 = require("@/services/alert");
const auth_1 = require("@/services/auth");
async function heartbeat(req, res) {
    try {
        const apiKey = req.headers['x-api-key'];
        const { deviceId, cpu, ram, disk } = req.body;
        if (!deviceId || cpu === undefined || ram === undefined || disk === undefined) {
            return res.status(400).json({
                error: 'Missing required fields: deviceId, cpu, ram, disk',
            });
        }
        const apiKeyRecord = await auth_1.authService.validateApiKey(apiKey);
        if (!apiKeyRecord) {
            return res.status(401).json({ error: 'Invalid or inactive API key' });
        }
        const device = await device_1.deviceService.updateDeviceMetrics(deviceId, cpu, ram);
        return res.json({
            deviceId,
            deviceDbId: device?._id,
            nextHeartbeatInterval: 30000,
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
async function getDevices(req, res) {
    try {
        if (!req.user || !req.orgId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { page = '1', limit = '10' } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const { devices, total } = await device_1.deviceService.getDevices(req.orgId, pageNum, limitNum);
        return res.json({
            devices,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
async function getDevice(req, res) {
    try {
        if (!req.user || !req.orgId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { id } = req.params;
        const device = await device_1.deviceService.getDevice(id, req.orgId);
        if (!device) {
            return res.status(404).json({ error: 'Device not found' });
        }
        return res.json(device);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
async function deleteDevice(req, res) {
    try {
        if (!req.user || !req.orgId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Only admins can delete devices' });
        }
        const { id } = req.params;
        const device = await device_1.deviceService.deleteDevice(id);
        return res.json({ message: 'Device deleted', device });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
async function registerAgent(req, res) {
    try {
        const apiKey = req.headers['x-api-key'];
        const { deviceId, deviceName } = req.body;
        if (!deviceId) {
            return res.status(400).json({
                error: 'Missing required field: deviceId',
            });
        }
        const apiKeyRecord = await auth_1.authService.validateApiKey(apiKey);
        if (!apiKeyRecord) {
            return res.status(401).json({ error: 'Invalid or inactive API key' });
        }
        const device = await device_1.deviceService.createDevice(apiKeyRecord.organizationId.toString(), deviceName || `Device ${deviceId.slice(0, 8)}`, deviceId);
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
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
async function getStats(req, res) {
    try {
        if (!req.user || !req.orgId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const stats = await device_1.deviceService.getStats(req.orgId);
        return res.json(stats);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
async function getDashboard(req, res) {
    try {
        if (!req.user || !req.orgId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const [deviceStats, alertStats] = await Promise.all([
            device_1.deviceService.getDashboard(req.orgId),
            alert_1.alertService.getStats(req.orgId),
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
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
//# sourceMappingURL=device.js.map