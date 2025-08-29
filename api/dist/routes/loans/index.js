"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const loans_1 = require("../../controllers/loans");
const router = (0, express_1.Router)();
router.get('/', loans_1.getLoans);
router.get('/:id', loans_1.getLoan);
router.post('/', loans_1.createLoan);
router.put('/:id/approve', loans_1.approveLoan);
router.put('/:id/fund', loans_1.fundLoan);
router.post('/:id/payment', loans_1.processPayment);
exports.default = router;
//# sourceMappingURL=index.js.map