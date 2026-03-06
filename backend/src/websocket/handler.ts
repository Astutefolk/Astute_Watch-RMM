import { Server, Socket } from 'socket.io';
import { getRedisClient } from '@/config/redis';
import { verifyAccessToken } from '@/utils/helpers';
import Device from '@/models/Device';
import { alertService } from '@/services/alert';
import { TokenPayload } from '@/types/index';

interface SocketUser extends TokenPayload {
  email: string;
}

declare module 'socket.io' {
  interface Socket {
    user?: SocketUser;
  }
}

let io: Server;

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
      const devicesToMarkOffline = await Device.find({
        status: 'ONLINE',
        lastSeen: { $lt: offlineThreshold },
      });

      // Update devices and broadcast
      for (const device of devicesToMarkOffline) {
        await Device.findByIdAndUpdate(
          device._id,
          { status: 'OFFLINE' },
          { new: true }
        );

        broadcastDeviceStatus(device.organizationId.toString(), device.name, false);

        // Create offline alert
        await alertService.createAlert(
          device.organizationId.toString(),
          `Device Offline`,
          `Device ${device.name} is offline`,
          'CRITICAL',
          device._id.toString()
        );
      }
    } catch (error) {
      console.error('Error checking offline devices:', error);
    }
  }, 2 * 60 * 1000); // Check every 2 minutes
}
