"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.heartbeat = heartbeat;
exports.getDevices = getDevices;
exports.getDevice = getDevice;
exports.deleteDevice = deleteDevice;
exports.registerAgent = registerAgent;
exports.getStats = getStats;
exports.getDashboard = getDashboard;
const device_1 = require("@/services/device");
const helpers_1 = require("@/utils/helpers");
const prisma_1 = require("@/database/prisma");
let deviceService = null;
function getDeviceService() {
    if (!deviceService) {
        deviceService = new device_1.DeviceService();
    }
    return deviceService;
}
const prisma = (0, prisma_1.getPrisma)();
async function heartbeat(req, res) {
    try {
        const apiKey = req.headers['x-api-key'];
        const { deviceId, cpu, ram, disk, osVersion } = req.body;
        if (!deviceId || cpu === undefined || ram === undefined || disk === undefined) {
            return res.status(400).json({
                error: 'Missing required fields: deviceId, cpu, ram, disk',
            });
        }
        // Validate API key and get organization
        const authService = new (await Promise.resolve().then(() => __importStar(require('@/services/auth')))).AuthService();
        const apiKeyRecord = await authService.validateApiKey(apiKey);
        if (!apiKeyRecord) {
            return res.status(401).json({ error: 'Invalid or inactive API key' });
        }
        // Record heartbeat
        const device = await getDeviceService().recordHeartbeat(deviceId, apiKeyRecord.organizationId, cpu, ram, disk, osVersion);
        return res.json({
            deviceId: device.deviceId,
            deviceDbId: device.id,
            nextHeartbeatInterval: 30000,
        });
    }
    catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: error.message });
    }
}
async function getDevices(req, res) {
    try {
        if (!req.user || !req.orgId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { page, limit } = req.query;
        const { skip, take } = (0, helpers_1.getPaginationParams)(page, limit);
        const { devices, total } = await getDeviceService().getDevices(req.orgId, skip, take);
        return res.json({
            devices,
            pagination: {
                total,
                page: Math.floor(skip / take) + 1,
                limit: take,
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
        const device = await getDeviceService().getDeviceById(id, req.orgId);
        return res.json(device);
    }
    catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: error.message });
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
        const device = await getDeviceService().deleteDevice(id, req.orgId);
        return res.json({ message: 'Device deleted', device });
    }
    catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: error.message });
    }
}
async function registerAgent(req, res) {
    try {
        const apiKey = req.headers['x-api-key'];
        const { deviceId, osVersion, deviceName } = req.body;
        if (!deviceId) {
            return res.status(400).json({
                error: 'Missing required field: deviceId',
            });
        }
        // Validate API key and get organization
        const authService = new (await Promise.resolve().then(() => __importStar(require('@/services/auth')))).AuthService();
        const apiKeyRecord = await authService.validateApiKey(apiKey);
        if (!apiKeyRecord) {
            return res.status(401).json({ error: 'Invalid or inactive API key' });
        }
        // Register the device
        const device = await getDeviceService().registerDevice(deviceId, apiKeyRecord.organizationId, osVersion);
        // Update device name if provided
        if (deviceName) {
            await prisma.device.update({
                where: { id: device.id },
                data: { name: deviceName },
            });
        }
        return res.status(201).json({
            success: true,
            device: {
                id: device.id,
                deviceId: device.deviceId,
                name: device.name,
                isOnline: device.isOnline,
            },
            message: 'Device registered successfully',
        });
    }
    catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: error.message });
    }
}
async function getStats(req, res) {
    try {
        if (!req.user || !req.orgId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const stats = await getDeviceService().getDeviceStats(req.orgId);
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
        const [deviceStats, recentAlerts, alertStats] = await Promise.all([
            getDeviceService().getDeviceStats(req.orgId),
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
        return res.json({
            stats: {
                totalDevices: deviceStats.total,
                onlineDevices: deviceStats.online,
                offlineDevices: deviceStats.offline,
                criticalAlerts: alertStats,
            },
            recentAlerts,
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
//# sourceMappingURL=device.js.map