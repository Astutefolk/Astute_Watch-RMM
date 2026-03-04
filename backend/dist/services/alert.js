"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertService = void 0;
const prisma_1 = require("@/database/prisma");
const helpers_1 = require("@/utils/helpers");
class AlertService {
    constructor() {
        this.prisma = (0, prisma_1.getPrisma)();
    }
    async getAlerts(orgId, skip, take, unresolved) {
        const where = { orgId };
        if (unresolved !== undefined) {
            where.isResolved = !unresolved;
        }
        const [alerts, total] = await Promise.all([
            this.prisma.alert.findMany({
                where,
                include: {
                    device: {
                        select: { name: true, deviceId: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            this.prisma.alert.count({ where }),
        ]);
        return { alerts, total };
    }
    async getAlertById(alertId, orgId) {
        const alert = await this.prisma.alert.findUnique({
            where: { id: alertId },
            include: {
                device: {
                    select: { name: true, deviceId: true },
                },
            },
        });
        if (!alert) {
            throw new helpers_1.AppError(404, 'Alert not found');
        }
        if (alert.orgId !== orgId) {
            throw new helpers_1.AppError(403, 'Alert does not belong to this organization');
        }
        return alert;
    }
    async resolveAlert(alertId, orgId) {
        await this.getAlertById(alertId, orgId);
        return this.prisma.alert.update({
            where: { id: alertId },
            data: {
                isResolved: true,
                resolvedAt: new Date(),
            },
        });
    }
    async getStats(orgId) {
        const [total, unresolved, critical] = await Promise.all([
            this.prisma.alert.count({
                where: { orgId },
            }),
            this.prisma.alert.count({
                where: { orgId, isResolved: false },
            }),
            this.prisma.alert.count({
                where: {
                    orgId,
                    severity: 'CRITICAL',
                    isResolved: false,
                },
            }),
        ]);
        return { total, unresolved, critical };
    }
}
exports.AlertService = AlertService;
//# sourceMappingURL=alert.js.map