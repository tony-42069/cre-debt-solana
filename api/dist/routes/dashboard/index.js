"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_1 = require("../../controllers/dashboard");
const router = (0, express_1.Router)();
router.get('/stats', dashboard_1.getDashboardStats);
exports.default = router;
//# sourceMappingURL=index.js.map