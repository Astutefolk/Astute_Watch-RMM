export interface TokenPayload {
    userId: string;
    orgId: string;
    email: string;
    role: 'ADMIN' | 'TECHNICIAN';
}
export interface AuthRequest {
    email: string;
    password: string;
}
export interface RegisterRequest {
    email: string;
    password: string;
    organizationName: string;
}
export interface DeviceHeartbeatRequest {
    deviceId: string;
    cpu: number;
    ram: number;
    disk: number;
    osVersion?: string;
}
export interface DeviceMetricsResponse {
    id: string;
    deviceId: string;
    cpu: number;
    ram: number;
    disk: number;
    timestamp: string;
}
export interface DeviceResponse {
    id: string;
    deviceId: string;
    name: string;
    osVersion: string | null;
    isOnline: boolean;
    lastSeen: string | null;
    metrics?: DeviceMetricsResponse;
}
export interface AlertResponse {
    id: string;
    type: string;
    severity: string;
    message: string;
    deviceId: string;
    isResolved: boolean;
    createdAt: string;
    resolvedAt: string | null;
}
export interface DashboardStatsResponse {
    totalDevices: number;
    onlineDevices: number;
    offlineDevices: number;
    recentAlerts: AlertResponse[];
    criticalAlerts: number;
}
export interface ApiKeyResponse {
    id: string;
    name: string;
    key: string;
    isActive: boolean;
    createdAt: string;
}
//# sourceMappingURL=index.d.ts.map