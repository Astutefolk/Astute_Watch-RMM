export declare class AlertService {
    createAlert(organizationId: string, title: string, message: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', deviceId?: string): Promise<import("mongoose").Document<unknown, {}, import("@/models/Alert").IAlert, {}, import("mongoose").DefaultSchemaOptions> & import("@/models/Alert").IAlert & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getAlerts(organizationId: string, page?: number, limit?: number, unresolved?: boolean): Promise<{
        alerts: (import("@/models/Alert").IAlert & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    getAlert(alertId: string, organizationId: string): Promise<(import("@/models/Alert").IAlert & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    resolveAlert(alertId: string): Promise<(import("@/models/Alert").IAlert & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    getStats(organizationId: string): Promise<{
        total: number;
        unresolved: number;
        critical: number;
        high: number;
    }>;
}
export declare const alertService: AlertService;
//# sourceMappingURL=alert.d.ts.map