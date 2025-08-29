"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../../controllers/loans/index");
const router = (0, express_1.Router)();
router.get('/', index_1.getLoanApplications);
router.get('/stats', index_1.getLoanStats);
router.get('/:id', index_1.getLoanApplication);
router.post('/', index_1.createLoanApplication);
router.put('/:id', index_1.updateLoanApplication);
router.post('/:id/submit', index_1.submitLoanApplication);
router.post('/:id/approve', index_1.approveLoanApplication);
router.post('/:id/reject', index_1.rejectLoanApplication);
exports.default = router;
//# sourceMappingURL=index.js.map