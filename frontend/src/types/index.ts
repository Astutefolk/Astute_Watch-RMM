export interface User {
  userId: string;
  email: string;
  orgId: string;
  role: 'ADMIN' | 'TECHNICIAN';
}

export interface Device {
  id: string;
  deviceId: string;
  name: string;
  osVersion: string | null;
  isOnline: boolean;
  lastSeen: string | null;
  metrics?: DeviceMetrics;
}

export interface DeviceMetrics {
  id: string;
  cpu: number;
  ram: number;
  disk: number;
  timestamp: string;
}

export interface Alert {
  id: string;
  type: 'CPU_HIGH' | 'RAM_HIGH' | 'DISK_HIGH' | 'DEVICE_OFFLINE' | 'DEVICE_ONLINE';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  deviceId: string;
  isResolved: boolean;
  createdAt: string;
  resolvedAt: string | null;
}

export interface DashboardStats {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  criticalAlerts: number;
  recentAlerts: Alert[];
}
