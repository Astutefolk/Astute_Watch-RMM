export declare class AlertService {
    private prisma;
    getAlerts(orgId: string, skip: number, take: number, unresolved?: boolean): Promise<{
        alerts: ({
            device: {
                name: string;
                deviceId: string;
            };
        } & {
            type: import(".prisma/client").$Enums.AlertType;
            message: string;
            id: string;
            deviceId: string;
            createdAt: Date;
            orgId: string;
            severity: import(".prisma/client").$Enums.AlertSeverity;
            isResolved: boolean;
            resolvedAt: Date | null;
        })[];
        total: number;
    }>;
    getAlertById(alertId: string, orgId: string): Promise<{
        device: {
            name: string;
            deviceId: string;
        };
    } & {
        type: import(".prisma/client").$Enums.AlertType;
        message: string;
        id: string;
        deviceId: string;
        createdAt: Date;
        orgId: string;
        severity: import(".prisma/client").$Enums.AlertSeverity;
        isResolved: boolean;
        resolvedAt: Date | null;
    }>;
    resolveAlert(alertId: string, orgId: string): Promise<{
        type: import(".prisma/client").$Enums.AlertType;
        message: string;
        id: string;
        deviceId: string;
        createdAt: Date;
        orgId: string;
        severity: import(".prisma/client").$Enums.AlertSeverity;
        isResolved: boolean;
        resolvedAt: Date | null;
    }>;
    getStats(orgId: string): Promise<{
        total: number;
        unresolved: number;
        critical: number;
    }>;
}
//# sourceMappingURL=alert.d.ts.map