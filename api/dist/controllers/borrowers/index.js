"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBorrowerKyc = exports.createBorrower = exports.getBorrower = exports.getBorrowers = void 0;
const getBorrowers = async (req, res, next) => {
    try {
        res.json({ success: true, message: 'Get borrowers endpoint - Coming soon!' });
    }
    catch (error) {
        next(error);
    }
};
exports.getBorrowers = getBorrowers;
const getBorrower = async (req, res, next) => {
    try {
        res.json({ success: true, message: 'Get borrower endpoint - Coming soon!' });
    }
    catch (error) {
        next(error);
    }
};
exports.getBorrower = getBorrower;
const createBorrower = async (req, res, next) => {
    try {
        res.json({ success: true, message: 'Create borrower endpoint - Coming soon!' });
    }
    catch (error) {
        next(error);
    }
};
exports.createBorrower = createBorrower;
const updateBorrowerKyc = async (req, res, next) => {
    try {
        res.json({ success: true, message: 'Update borrower KYC endpoint - Coming soon!' });
    }
    catch (error) {
        next(error);
    }
};
exports.updateBorrowerKyc = updateBorrowerKyc;
//# sourceMappingURL=index.js.map