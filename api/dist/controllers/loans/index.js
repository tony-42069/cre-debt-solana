"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processPayment = exports.fundLoan = exports.approveLoan = exports.createLoan = exports.getLoan = exports.getLoans = void 0;
const getLoans = async (req, res, next) => {
    try {
        res.json({ success: true, message: 'Get loans endpoint - Coming soon!' });
    }
    catch (error) {
        next(error);
    }
};
exports.getLoans = getLoans;
const getLoan = async (req, res, next) => {
    try {
        res.json({ success: true, message: 'Get loan endpoint - Coming soon!' });
    }
    catch (error) {
        next(error);
    }
};
exports.getLoan = getLoan;
const createLoan = async (req, res, next) => {
    try {
        res.json({ success: true, message: 'Create loan endpoint - Coming soon!' });
    }
    catch (error) {
        next(error);
    }
};
exports.createLoan = createLoan;
const approveLoan = async (req, res, next) => {
    try {
        res.json({ success: true, message: 'Approve loan endpoint - Coming soon!' });
    }
    catch (error) {
        next(error);
    }
};
exports.approveLoan = approveLoan;
const fundLoan = async (req, res, next) => {
    try {
        res.json({ success: true, message: 'Fund loan endpoint - Coming soon!' });
    }
    catch (error) {
        next(error);
    }
};
exports.fundLoan = fundLoan;
const processPayment = async (req, res, next) => {
    try {
        res.json({ success: true, message: 'Process payment endpoint - Coming soon!' });
    }
    catch (error) {
        next(error);
    }
};
exports.processPayment = processPayment;
//# sourceMappingURL=index.js.map