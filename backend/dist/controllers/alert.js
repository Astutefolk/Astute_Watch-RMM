"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlerts = getAlerts;
exports.getAlert = getAlert;
exports.resolveAlert = resolveAlert;
exports.getStats = getStats;
const alert_1 = require("@/services/alert");
async function getAlerts(req, res) {
    try {
        if (!req.user || !req.orgId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { page = '1', limit = '10', unresolved } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const { alerts, total } = await alert_1.alertService.getAlerts(req.orgId, pageNum, limitNum, unresolved === 'true');
        return res.json({
            alerts,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum),
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
        const alert = await alert_1.alertService.getAlert(id, req.orgId);
        if (!alert) {
            return res.status(404).json({ error: 'Alert not found' });
        }
        return res.json(alert);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
async function resolveAlert(req, res) {
    try {
        if (!req.user || !req.orgId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { id } = req.params;
        const alert = await alert_1.alertService.resolveAlert(id);
        return res.json(alert);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
async function getStats(req, res) {
    try {
        if (!req.user || !req.orgId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const stats = await alert_1.alertService.getStats(req.orgId);
        return res.json(stats);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
//# sourceMappingURL=alert.js.map