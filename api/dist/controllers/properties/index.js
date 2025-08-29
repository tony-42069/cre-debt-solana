"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProperty = exports.createProperty = exports.getProperty = exports.getProperties = void 0;
const getProperties = async (req, res, next) => {
    try {
        res.json({ success: true, message: 'Get properties endpoint - Coming soon!' });
    }
    catch (error) {
        next(error);
    }
};
exports.getProperties = getProperties;
const getProperty = async (req, res, next) => {
    try {
        res.json({ success: true, message: 'Get property endpoint - Coming soon!' });
    }
    catch (error) {
        next(error);
    }
};
exports.getProperty = getProperty;
const createProperty = async (req, res, next) => {
    try {
        res.json({ success: true, message: 'Create property endpoint - Coming soon!' });
    }
    catch (error) {
        next(error);
    }
};
exports.createProperty = createProperty;
const updateProperty = async (req, res, next) => {
    try {
        res.json({ success: true, message: 'Update property endpoint - Coming soon!' });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProperty = updateProperty;
//# sourceMappingURL=index.js.map