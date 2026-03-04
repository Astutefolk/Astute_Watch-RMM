"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlerts = getAlerts;
exports.getAlert = getAlert;
exports.resolveAlert = resolveAlert;
exports.getStats = getStats;
const alert_1 = require("@/services/alert");
const helpers_1 = require("@/utils/helpers");
let alertService = null;
function getAlertService() {
    if (!alertService) {
        alertService = new alert_1.AlertService();
    }
    return alertService;
}
async function getAlerts(req, res) {
    try {
        if (!req.user || !req.orgId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { page, limit, unresolved } = req.query;
        const { skip, take } = (0, helpers_1.getPaginationParams)(page, limit);
        const { alerts, total } = await getAlertService().getAlerts(req.orgId, skip, take, unresolved === 'true');
        return res.json({
            alerts,
            pagination: {
                total,
                page: Math.floor(skip / take) + 1,
                limit: take,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
async function getAlert(req, res) {
    try {
        if (!req.user || !req.orgId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { id } = req.params;
        const alert = await getAlertService().getAlertById(id, req.orgId);
        return res.json(alert);
    }
    catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: error.message });
    }
}
async function resolveAlert(req, res) {
    try {
        if (!req.user || !req.orgId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { id } = req.params;
        const alert = await getAlertService().resolveAlert(id, req.orgId);
        return res.json(alert);
    }
    catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ error: error.message });
    }
}
async function getStats(req, res) {
    try {
        if (!req.user || !req.orgId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const stats = await getAlertService().getStats(req.orgId);
        return res.json(stats);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
//# sourceMappingURL=alert.js.map