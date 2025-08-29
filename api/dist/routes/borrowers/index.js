"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const borrowers_1 = require("../../controllers/borrowers");
const router = (0, express_1.Router)();
router.get('/', borrowers_1.getBorrowers);
router.get('/:id', borrowers_1.getBorrower);
router.post('/', borrowers_1.createBorrower);
router.put('/:id/kyc', borrowers_1.updateBorrowerKyc);
exports.default = router;
//# sourceMappingURL=index.js.map