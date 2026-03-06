export declare class DeviceService {
    createDevice(organizationId: string, name: string, hostname?: string): Promise<import("mongoose").Document<unknown, {}, import("@/models/Device").IDevice, {}, import("mongoose").DefaultSchemaOptions> & import("@/models/Device").IDevice & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getDevices(organizationId: string, page?: number, limit?: number): Promise<{
        devices: (import("@/models/Device").IDevice & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    getDevice(deviceId: string, organizationId: string): Promise<(import("@/models/Device").IDevice & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    updateDeviceStatus(deviceId: string, status: 'ONLINE' | 'OFFLINE' | 'ERROR'): Promise<(import("@/models/Device").IDevice & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    updateDeviceMetrics(deviceId: string, cpuUsage: number, memoryUsage: number): Promise<(import("@/models/Device").IDevice & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    deleteDevice(deviceId: string): Promise<(import("@/models/Device").IDevice & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    getDashboard(organizationId: string): Promise<{
        totalDevices: number;
        online: number;
        offline: number;
        avgCpu: number;
        avgMemory: number;
    }>;
    getStats(organizationId: string): Promise<{
        total: number;
        online: number;
        offline: number;
        error: number;
    }>;
}
export declare const deviceService: DeviceService;
//# sourceMappingURL=device.d.ts.map