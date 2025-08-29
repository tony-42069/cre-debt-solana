"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const platform_1 = require("../../controllers/platform");
const router = (0, express_1.Router)();
router.get('/config', platform_1.getPlatformConfig);
router.put('/config', platform_1.updatePlatformConfig);
router.get('/stats', platform_1.getPlatformStats);
exports.default = router;
//# sourceMappingURL=index.js.map