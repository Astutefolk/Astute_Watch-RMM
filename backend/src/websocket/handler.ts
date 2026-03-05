import { Server, Socket } from 'socket.io';
import { getRedisClient } from '@/config/redis';
import { verifyAccessToken } from '@/utils/helpers';
import { getPrisma } from '@/database/prisma';

let prisma: ReturnType<typeof getPrisma> | null = null;
let io: Server;

interface SocketUser {
  userId: string;
  orgId: string;
  role: string;
  email: string;
}

declare module 'socket.io' {
  interface Socket {
    user?: SocketUser;
  }
}

function getPrismaClient() {
  if (!prisma) {
    prisma = getPrisma();
  }
  return prisma;
}

export function initWebSocket(httpServer: any) {
  io = new Server(httpServer, {
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

    const payload = verifyAccessToken(token);
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
  io.on('connection', (socket: Socket) => {
    console.log(`User ${socket.user?.email} connected`);

    // Join org-specific room
    if (socket.user) {
      socket.join(`org:${socket.user.orgId}`);
      socket.emit('connected', { message: 'Connected to RMM' });
    }

    // Subscribe to device updates
    socket.on('subscribe:device', (deviceId: string) => {
      socket.join(`device:${deviceId}`);
      socket.emit('subscribed', { deviceId });
    });

    // Unsubscribe from device updates
    socket.on('unsubscribe:device', (deviceId: string) => {
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

export function getWebSocket() {
  return io;
}

// Broadcast device metrics update
export async function broadcastMetricsUpdate(deviceId: string, metrics: any) {
  if (io) {
    io.to(`device:${deviceId}`).emit('device:metrics', {
      deviceId,
      metrics,
      timestamp: new Date().toISOString(),
    });
  }
}

// Broadcast device status change
export async function broadcastDeviceStatus(
  orgId: string,
  deviceId: string,
  isOnline: boolean
) {
  if (io) {
    io.to(`org:${orgId}`).emit('device:status', {
      deviceId,
      isOnline,
      timestamp: new Date().toISOString(),
    });
  }
}

// Broadcast alert created
export async function broadcastAlert(orgId: string, alert: any) {
  if (io) {
    io.to(`org:${orgId}`).emit('alert:created', {
      alert,
      timestamp: new Date().toISOString(),
    });
  }
}

// Subscribe to Redis events and broadcast to socket clients
export async function setupRedisSubscriber() {
  const redis = getRedisClient();
  const subscriber = redis.duplicate();

  // Subscribe to alert channels for all orgs
  await subscriber.pSubscribe('alerts:*', (message: string, channel: string) => {
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
export async function setupOfflineDeviceChecker() {
  const { envConfig } = await import('@/config/env');

  setInterval(async () => {
    try {
      const offlineThreshold = new Date(
        Date.now() - envConfig.agentOfflineThreshold
      );

      // Find devices that should be offline
      const devicesToMarkOffline = await getPrismaClient().device.findMany({
        where: {
          isOnline: true,
          lastSeen: {
            lt: offlineThreshold,
          },
        },
      });

      // Update devices and broadcast
      for (const device of devicesToMarkOffline) {
        await getPrismaClient().device.update({
          where: { id: device.id },
          data: { isOnline: false },
        });

        broadcastDeviceStatus(device.organizationId, device.deviceId, false);

        // Create offline alert
        const { DeviceService } = await import('@/services/device');
        const deviceService = new DeviceService();
        await deviceService.createAlert(
          device.id,
          device.organizationId,
          'DEVICE_OFFLINE' as any,
          'CRITICAL' as any,
          `Device ${device.name} is offline`
        );
      }
    } catch (error) {
      console.error('Error checking offline devices:', error);
    }
  }, 2 * 60 * 1000); // Check every 2 minutes
}
