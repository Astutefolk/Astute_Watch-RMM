declare const AlertType: {
    readonly CPU_HIGH: "CPU_HIGH";
    readonly RAM_HIGH: "RAM_HIGH";
    readonly DISK_HIGH: "DISK_HIGH";
    readonly DEVICE_OFFLINE: "DEVICE_OFFLINE";
    readonly DEVICE_ONLINE: "DEVICE_ONLINE";
};
declare const AlertSeverity: {
    readonly INFO: "INFO";
    readonly WARNING: "WARNING";
    readonly CRITICAL: "CRITICAL";
};
type AlertType = typeof AlertType[keyof typeof AlertType];
type AlertSeverity = typeof AlertSeverity[keyof typeof AlertSeverity];
export declare class DeviceService {
    private prisma;
    private redis;
    private getRedis;
    registerDevice(deviceId: string, orgId: string, osVersion?: string): Promise<{
        name: string;
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        deviceId: string;
        osVersion: string | null;
        lastSeen: Date | null;
        isOnline: boolean;
    }>;
    recordHeartbeat(deviceId: string, orgId: string, cpu: number, ram: number, disk: number, osVersion?: string): Promise<{
        name: string;
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        deviceId: string;
        osVersion: string | null;
        lastSeen: Date | null;
        isOnline: boolean;
    }>;
    checkAndCreateAlerts(deviceId: string, orgId: string, cpu: number, ram: number, disk: number): Promise<void>;
    createAlert(deviceId: string, orgId: string, type: AlertType, severity: AlertSeverity, message: string): Promise<{
        type: import(".prisma/client").$Enums.AlertType;
        message: string;
        id: string;
        createdAt: Date;
        orgId: string;
        deviceId: string;
        severity: import(".prisma/client").$Enums.AlertSeverity;
        isResolved: boolean;
        resolvedAt: Date | null;
    }>;
    getDevices(orgId: string, skip: number, take: number): Promise<{
        devices: ({
            metrics: {
                id: string;
                createdAt: Date;
                orgId: string;
                deviceId: string;
                cpu: number;
                ram: number;
                disk: number;
                timestamp: Date;
            }[];
        } & {
            name: string;
            id: string;
            organizationId: string;
            createdAt: Date;
            updatedAt: Date;
            deviceId: string;
            osVersion: string | null;
            lastSeen: Date | null;
            isOnline: boolean;
        })[];
        total: number;
    }>;
    getDeviceById(deviceId: string, orgId: string): Promise<{
        metrics: {
            id: string;
            createdAt: Date;
            orgId: string;
            deviceId: string;
            cpu: number;
            ram: number;
            disk: number;
            timestamp: Date;
        }[];
    } & {
        name: string;
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        deviceId: string;
        osVersion: string | null;
        lastSeen: Date | null;
        isOnline: boolean;
    }>;
    deleteDevice(deviceId: string, orgId: string): Promise<{
        name: string;
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        deviceId: string;
        osVersion: string | null;
        lastSeen: Date | null;
        isOnline: boolean;
    }>;
    getDeviceStats(orgId: string): Promise<{
        total: number;
        online: number;
        offline: number;
    }>;
}
export {};
//# sourceMappingURL=device.d.ts.map