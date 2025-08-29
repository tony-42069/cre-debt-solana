"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../../controllers/properties/index");
const router = (0, express_1.Router)();
router.get('/', index_1.getProperties);
router.get('/stats', index_1.getPropertyStats);
router.get('/:id', index_1.getProperty);
router.post('/', index_1.createProperty);
router.put('/:id', index_1.updateProperty);
router.delete('/:id', index_1.deleteProperty);
exports.default = router;
//# sourceMappingURL=index.js.map