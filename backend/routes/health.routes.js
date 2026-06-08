"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const health_controller_1 = require("../controllers/health.controller");
const router = (0, express_1.Router)();
const controller = new health_controller_1.HealthController();
router.get('/', (req, res) => controller.check(req, res));
exports.default = router;
//# sourceMappingURL=health.routes.js.map