"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
class HealthController {
    check(req, res) {
        res.json({ data: { status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() }, meta: { service: 'Board Application API', version: '0.3.0' } });
    }
}
exports.HealthController = HealthController;
//# sourceMappingURL=health.controller.js.map