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
exports.initWebSocket = initWebSocket;
exports.getWebSocket = getWebSocket;
exports.broadcastMetricsUpdate = broadcastMetricsUpdate;
exports.broadcastDeviceStatus = broadcastDeviceStatus;
exports.broadcastAlert = broadcastAlert;
exports.setupRedisSubscriber = setupRedisSubscriber;
exports.setupOfflineDeviceChecker = setupOfflineDeviceChecker;
const socket_io_1 = require("socket.io");
const redis_1 = require("@/config/redis");
const helpers_1 = require("@/utils/helpers");
const prisma_1 = require("@/database/prisma");
const prisma = (0, prisma_1.getPrisma)();
let io;
function initWebSocket(httpServer) {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3001'],
            credentials: true,
        },
        transports: ['websocket', 'polling'],
    });
    // Middleware - Authenticate socket connection
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }
        const payload = (0, helpers_1.verifyAccessToken)(token);
        if (!payload) {
            return next(new Error('Invalid token'));
        }
        socket.user = {
            userId: payload.userId,
            orgId: payload.orgId,
            role: payload.role,
            email: payload.email,
        };
        next();
    });
    // Connection handler
    io.on('connection', (socket) => {
        console.log(`User ${socket.user?.email} connected`);
        // Join org-specific room
        if (socket.user) {
            socket.join(`org:${socket.user.orgId}`);
            socket.emit('connected', { message: 'Connected to RMM' });
        }
        // Subscribe to device updates
        socket.on('subscribe:device', (deviceId) => {
            socket.join(`device:${deviceId}`);
            socket.emit('subscribed', { deviceId });
        });
        // Unsubscribe from device updates
        socket.on('unsubscribe:device', (deviceId) => {
            socket.leave(`device:${deviceId}`);
            socket.emit('unsubscribed', { deviceId });
        });
        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`User ${socket.user?.email} disconnected`);
        });
        // Heartbeat to keep connection alive
        socket.on('ping', () => {
            socket.emit('pong');
        });
    });
    return io;
}
function getWebSocket() {
    return io;
}
// Broadcast device metrics update
async function broadcastMetricsUpdate(deviceId, metrics) {
    if (io) {
        io.to(`device:${deviceId}`).emit('device:metrics', {
            deviceId,
            metrics,
            timestamp: new Date().toISOString(),
        });
    }
}
// Broadcast device status change
async function broadcastDeviceStatus(orgId, deviceId, isOnline) {
    if (io) {
        io.to(`org:${orgId}`).emit('device:status', {
            deviceId,
            isOnline,
            timestamp: new Date().toISOString(),
        });
    }
}
// Broadcast alert created
async function broadcastAlert(orgId, alert) {
    if (io) {
        io.to(`org:${orgId}`).emit('alert:created', {
            alert,
            timestamp: new Date().toISOString(),
        });
    }
}
// Subscribe to Redis events and broadcast to socket clients
async function setupRedisSubscriber() {
    const redis = (0, redis_1.getRedisClient)();
    const subscriber = redis.duplicate();
    // Subscribe to alert channels for all orgs
    await subscriber.pSubscribe('alerts:*', (message, channel) => {
        if (channel.startsWith('alerts:')) {
            const orgId = channel.split(':')[1];
            const data = JSON.parse(message);
            if (io) {
                io.to(`org:${orgId}`).emit(data.event, data.data);
            }
        }
    });
}
// Check offline devices every 2 minutes and broadcast status changes
async function setupOfflineDeviceChecker() {
    const { envConfig } = await Promise.resolve().then(() => __importStar(require('@/config/env')));
    setInterval(async () => {
        try {
            const offlineThreshold = new Date(Date.now() - envConfig.agentOfflineThreshold);
            // Find devices that should be offline
            const devicesToMarkOffline = await prisma.device.findMany({
                where: {
                    isOnline: true,
                    lastSeen: {
                        lt: offlineThreshold,
                    },
                },
            });
            // Update devices and broadcast
            for (const device of devicesToMarkOffline) {
                await prisma.device.update({
                    where: { id: device.id },
                    data: { isOnline: false },
                });
                broadcastDeviceStatus(device.organizationId, device.deviceId, false);
                // Create offline alert
                const { DeviceService } = await Promise.resolve().then(() => __importStar(require('@/services/device')));
                const deviceService = new DeviceService();
                await deviceService.createAlert(device.id, device.organizationId, 'DEVICE_OFFLINE', 'CRITICAL', `Device ${device.name} is offline`);
            }
        }
        catch (error) {
            console.error('Error checking offline devices:', error);
        }
    }, 2 * 60 * 1000); // Check every 2 minutes
}
//# sourceMappingURL=handler.js.map