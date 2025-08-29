"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payments_1 = require("../../controllers/payments");
const router = (0, express_1.Router)();
router.post('/process', payments_1.processPayment);
router.get('/history', payments_1.getPaymentHistory);
router.get('/upcoming', payments_1.getUpcomingPayments);
exports.default = router;
//# sourceMappingURL=index.js.map