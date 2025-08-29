"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const properties_1 = require("../../controllers/properties");
const router = (0, express_1.Router)();
router.get('/', properties_1.getProperties);
router.get('/:id', properties_1.getProperty);
router.post('/', properties_1.createProperty);
router.put('/:id', properties_1.updateProperty);
exports.default = router;
//# sourceMappingURL=index.js.map