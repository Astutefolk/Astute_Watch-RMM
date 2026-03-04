import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth';
import { useDashboardStore } from '@/store/dashboard';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';

let socket: Socket | null = null;

export function initWebSocket(): Socket {
  if (socket?.connected) {
    return socket;
  }

  const { accessToken } = useAuthStore.getState();

  socket = io(WS_URL, {
    auth: {
      token: accessToken,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('✅ Connected to WebSocket');
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected from WebSocket');
  });

  socket.on('device:metrics', (data) => {
    const { deviceId, metrics } = data;
    useDashboardStore.getState().updateDeviceMetrics(deviceId, metrics);
  });

  socket.on('device:status', (data) => {
    const { deviceId, isOnline } = data;
    useDashboardStore.getState().updateDeviceStatus(deviceId, isOnline);
  });

  socket.on('alert:created', (alert) => {
    useDashboardStore.getState().addAlert(alert);
  });

  return socket;
}

export function getWebSocket(): Socket | null {
  return socket;
}

export function closeWebSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function subscribeToDevice(deviceId: string) {
  if (socket) {
    socket.emit('subscribe:device', deviceId);
  }
}

export function unsubscribeFromDevice(deviceId: string) {
  if (socket) {
    socket.emit('unsubscribe:device', deviceId);
  }
}
