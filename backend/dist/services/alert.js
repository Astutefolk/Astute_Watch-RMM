"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertService = exports.AlertService = void 0;
const Alert_1 = __importDefault(require("@/models/Alert"));
class AlertService {
    async createAlert(organizationId, title, message, severity, deviceId) {
        return await Alert_1.default.create({
            organizationId,
            title,
            message,
            severity,
            deviceId,
            status: 'UNRESOLVED',
        });
    }
    async getAlerts(organizationId, page = 1, limit = 10, unresolved = false) {
        const skip = (page - 1) * limit;
        const query = { organizationId };
        if (unresolved)
            query.status = 'UNRESOLVED';
        const [alerts, total] = await Promise.all([
            Alert_1.default.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Alert_1.default.countDocuments(query),
        ]);
        return { alerts, total, page, limit };
    }
    async getAlert(alertId, organizationId) {
        return await Alert_1.default.findOne({ _id: alertId, organizationId }).lean();
    }
    async resolveAlert(alertId) {
        return await Alert_1.default.findByIdAndUpdate(alertId, { status: 'RESOLVED', resolvedAt: new Date() }, { new: true }).lean();
    }
    async getStats(organizationId) {
        const alerts = await Alert_1.default.find({ organizationId }).lean();
        const unresolved = alerts.filter((a) => a.status === 'UNRESOLVED').length;
        const critical = alerts.filter((a) => a.severity === 'CRITICAL').length;
        const high = alerts.filter((a) => a.severity === 'HIGH').length;
        return { total: alerts.length, unresolved, critical, high };
    }
}
exports.AlertService = AlertService;
exports.alertService = new AlertService();
//# sourceMappingURL=alert.js.map