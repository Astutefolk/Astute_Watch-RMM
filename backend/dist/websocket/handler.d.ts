import { Server } from 'socket.io';
import { TokenPayload } from '@/types/index';
interface SocketUser extends TokenPayload {
    email: string;
}
declare module 'socket.io' {
    interface Socket {
        user?: SocketUser;
    }
}
export declare function initWebSocket(httpServer: any): Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export declare function getWebSocket(): Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export declare function broadcastMetricsUpdate(deviceId: string, metrics: any): Promise<void>;
export declare function broadcastDeviceStatus(orgId: string, deviceId: string, isOnline: boolean): Promise<void>;
export declare function broadcastAlert(orgId: string, alert: any): Promise<void>;
export declare function setupRedisSubscriber(): Promise<void>;
export declare function setupOfflineDeviceChecker(): Promise<void>;
export {};
//# sourceMappingURL=handler.d.ts.map