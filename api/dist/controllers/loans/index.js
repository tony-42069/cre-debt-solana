"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLoanStats = exports.rejectLoanApplication = exports.approveLoanApplication = exports.submitLoanApplication = exports.updateLoanApplication = exports.createLoanApplication = exports.getLoanApplication = exports.getLoanApplications = void 0;
const client_1 = require("@prisma/client");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../../uploads');
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, JPEG, PNG files are allowed.'));
        }
    }
});
const getLoanApplications = async (req, res, next) => {
    try {
        const { walletAddress } = req.query;
        if (!walletAddress || typeof walletAddress !== 'string') {
            res.status(400).json({
                success: false,
                error: 'Wallet address is required'
            });
            return;
        }
        let user = await prisma.user.findUnique({
            where: { walletAddress }
        });
        if (!user) {
            res.json({
                success: true,
                data: [],
                message: 'No loan applications found for this wallet address'
            });
            return;
        }
        const applications = await prisma.loanApplication.findMany({
            where: { borrowerId: user.id },
            include: {
                property: {
                    select: {
                        id: true,
                        propertyId: true,
                        address: true,
                        city: true,
                        state: true,
                        appraisedValue: true
                    }
                },
                loan: {
                    select: {
                        id: true,
                        status: true,
                        fundedAt: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({
            success: true,
            data: applications,
            count: applications.length
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getLoanApplications = getLoanApplications;
const getLoanApplication = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({
                success: false,
                error: 'Application ID is required'
            });
            return;
        }
        const application = await prisma.loanApplication.findUnique({
            where: { id },
            include: {
                borrower: {
                    select: {
                        id: true,
                        walletAddress: true,
                        entityType: true
                    }
                },
                property: true,
                loan: {
                    include: {
                        payments: {
                            orderBy: { dueDate: 'desc' },
                            take: 5
                        }
                    }
                }
            }
        });
        if (!application) {
            res.status(404).json({
                success: false,
                error: 'Loan application not found'
            });
            return;
        }
        res.json({
            success: true,
            data: application
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getLoanApplication = getLoanApplication;
exports.createLoanApplication = [
    upload.fields([
        { name: 'financialStatements', maxCount: 5 },
        { name: 'taxReturns', maxCount: 3 },
        { name: 'bankStatements', maxCount: 5 },
        { name: 'additionalDocs', maxCount: 10 }
    ]),
    async (req, res, next) => {
        try {
            const { walletAddress, propertyId, requestedAmount, termMonths, interestRate, loanPurpose, annualIncome, monthlyDebt, employmentStatus, creditScore } = req.body;
            if (!walletAddress || !propertyId || !requestedAmount || !termMonths) {
                res.status(400).json({
                    success: false,
                    error: 'Missing required fields'
                });
                return;
            }
            let user = await prisma.user.findUnique({
                where: { walletAddress }
            });
            if (!user) {
                user = await prisma.user.create({
                    data: {
                        walletAddress,
                        entityType: 'INDIVIDUAL'
                    }
                });
            }
            const property = await prisma.property.findFirst({
                where: {
                    id: propertyId,
                    ownerId: user.id
                }
            });
            if (!property) {
                res.status(404).json({
                    success: false,
                    error: 'Property not found or not owned by this user'
                });
                return;
            }
            const requestedAmountNum = parseFloat(requestedAmount);
            const ltvRatio = (requestedAmountNum / property.appraisedValue) * 100;
            if (ltvRatio > 90) {
                res.status(400).json({
                    success: false,
                    error: 'Loan-to-value ratio cannot exceed 90%'
                });
                return;
            }
            const applicationId = `APP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            const files = req.files;
            const fileData = {};
            if (files.financialStatements?.length) {
                fileData.financialStatements = files.financialStatements.map(file => file.path);
            }
            if (files.taxReturns?.length) {
                fileData.taxReturns = files.taxReturns.map(file => file.path);
            }
            if (files.bankStatements?.length) {
                fileData.bankStatements = files.bankStatements.map(file => file.path);
            }
            if (files.additionalDocs?.length) {
                fileData.additionalDocs = files.additionalDocs.map(file => file.path);
            }
            const application = await prisma.loanApplication.create({
                data: {
                    applicationId,
                    borrowerId: user.id,
                    propertyId,
                    requestedAmount: requestedAmountNum,
                    termMonths: parseInt(termMonths),
                    interestRate: interestRate ? parseFloat(interestRate) : 0.08,
                    ltvRatio,
                    purpose: loanPurpose || 'Working Capital',
                    status: 'DRAFT',
                    additionalDocs: fileData.additionalDocs ? JSON.stringify(fileData.additionalDocs) : null
                }
            });
            await prisma.auditLog.create({
                data: {
                    action: 'LOAN_APPLICATION_CREATED',
                    entityType: 'LoanApplication',
                    entityId: application.id,
                    userId: user.id,
                    walletAddress: user.walletAddress,
                    newValues: {
                        applicationId,
                        requestedAmount: requestedAmountNum,
                        ltvRatio,
                        propertyId
                    }
                }
            });
            res.status(201).json({
                success: true,
                data: application,
                message: 'Loan application submitted successfully'
            });
        }
        catch (error) {
            next(error);
        }
    }
];
exports.updateLoanApplication = [
    upload.fields([
        { name: 'financialStatements', maxCount: 5 },
        { name: 'taxReturns', maxCount: 3 },
        { name: 'bankStatements', maxCount: 5 },
        { name: 'additionalDocs', maxCount: 10 }
    ]),
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const updateData = req.body;
            if (!id) {
                res.status(400).json({
                    success: false,
                    error: 'Application ID is required'
                });
                return;
            }
            const existingApplication = await prisma.loanApplication.findUnique({
                where: { id }
            });
            if (!existingApplication) {
                res.status(404).json({
                    success: false,
                    error: 'Loan application not found'
                });
                return;
            }
            const updateFields = {};
            if (updateData.requestedAmount)
                updateFields.requestedAmount = parseFloat(updateData.requestedAmount);
            if (updateData.termMonths)
                updateFields.termMonths = parseInt(updateData.termMonths);
            if (updateData.interestRate)
                updateFields.interestRate = parseFloat(updateData.interestRate);
            if (updateData.purpose)
                updateFields.purpose = updateData.purpose;
            if (updateData.status)
                updateFields.status = updateData.status;
            if (updateData.requestedAmount) {
                const property = await prisma.property.findUnique({
                    where: { id: existingApplication.propertyId }
                });
                if (property) {
                    updateFields.ltvRatio = (parseFloat(updateData.requestedAmount) / property.appraisedValue) * 100;
                }
            }
            const files = req.files;
            if (files.additionalDocs?.length) {
                updateFields.additionalDocs = JSON.stringify(files.additionalDocs.map(file => file.path));
            }
            const updatedApplication = await prisma.loanApplication.update({
                where: { id },
                data: updateFields
            });
            await prisma.auditLog.create({
                data: {
                    action: 'LOAN_APPLICATION_UPDATED',
                    entityType: 'LoanApplication',
                    entityId: id,
                    oldValues: existingApplication,
                    newValues: updateFields
                }
            });
            res.json({
                success: true,
                data: updatedApplication,
                message: 'Loan application updated successfully'
            });
        }
        catch (error) {
            next(error);
        }
    }
];
const submitLoanApplication = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({
                success: false,
                error: 'Application ID is required'
            });
            return;
        }
        const application = await prisma.loanApplication.findUnique({
            where: { id },
            include: { property: true }
        });
        if (!application) {
            res.status(404).json({
                success: false,
                error: 'Loan application not found'
            });
            return;
        }
        const updatedApplication = await prisma.loanApplication.update({
            where: { id },
            data: {
                status: 'SUBMITTED',
                submittedAt: new Date()
            }
        });
        await prisma.auditLog.create({
            data: {
                action: 'LOAN_APPLICATION_SUBMITTED',
                entityType: 'LoanApplication',
                entityId: id,
                newValues: {
                    status: 'SUBMITTED',
                    submittedAt: new Date()
                }
            }
        });
        res.json({
            success: true,
            data: updatedApplication,
            message: 'Loan application submitted for review'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.submitLoanApplication = submitLoanApplication;
const approveLoanApplication = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { approvedAmount, approvedRate, approvedTerm } = req.body;
        if (!id) {
            res.status(400).json({
                success: false,
                error: 'Application ID is required'
            });
            return;
        }
        const application = await prisma.loanApplication.findUnique({
            where: { id },
            include: { borrower: true, property: true }
        });
        if (!application) {
            res.status(404).json({
                success: false,
                error: 'Loan application not found'
            });
            return;
        }
        await prisma.loanApplication.update({
            where: { id },
            data: {
                status: 'APPROVED',
                approvedAt: new Date(),
                reviewedAt: new Date()
            }
        });
        const loanId = `LOAN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const loan = await prisma.loan.create({
            data: {
                loanId,
                applicationId: application.id,
                borrowerId: application.borrowerId,
                principalAmount: approvedAmount || application.requestedAmount,
                interestRate: approvedRate || application.interestRate,
                termMonths: approvedTerm || application.termMonths,
                ltvRatio: application.ltvRatio,
                status: 'APPROVED',
                maturityDate: new Date(Date.now() + ((approvedTerm || application.termMonths) * 30 * 24 * 60 * 60 * 1000)),
                remainingBalance: approvedAmount || application.requestedAmount
            }
        });
        await prisma.auditLog.create({
            data: {
                action: 'LOAN_APPLICATION_APPROVED',
                entityType: 'LoanApplication',
                entityId: id,
                newValues: {
                    status: 'APPROVED',
                    loanId: loan.id
                }
            }
        });
        res.json({
            success: true,
            data: { application, loan },
            message: 'Loan application approved successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.approveLoanApplication = approveLoanApplication;
const rejectLoanApplication = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        if (!id) {
            res.status(400).json({
                success: false,
                error: 'Application ID is required'
            });
            return;
        }
        const application = await prisma.loanApplication.findUnique({
            where: { id }
        });
        if (!application) {
            res.status(404).json({
                success: false,
                error: 'Loan application not found'
            });
            return;
        }
        const updatedApplication = await prisma.loanApplication.update({
            where: { id },
            data: {
                status: 'REJECTED',
                rejectedAt: new Date(),
                reviewedAt: new Date(),
                rejectionReason: reason || 'Application rejected by reviewer'
            }
        });
        await prisma.auditLog.create({
            data: {
                action: 'LOAN_APPLICATION_REJECTED',
                entityType: 'LoanApplication',
                entityId: id,
                newValues: {
                    status: 'REJECTED',
                    rejectionReason: reason || 'Application rejected by reviewer'
                }
            }
        });
        res.json({
            success: true,
            data: updatedApplication,
            message: 'Loan application rejected'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.rejectLoanApplication = rejectLoanApplication;
const getLoanStats = async (req, res, next) => {
    try {
        const { walletAddress } = req.query;
        if (!walletAddress || typeof walletAddress !== 'string') {
            res.status(400).json({
                success: false,
                error: 'Wallet address is required'
            });
            return;
        }
        const user = await prisma.user.findUnique({
            where: { walletAddress }
        });
        if (!user) {
            res.json({
                success: true,
                data: {
                    totalApplications: 0,
                    pendingApplications: 0,
                    approvedApplications: 0,
                    rejectedApplications: 0,
                    totalRequested: 0,
                    totalApproved: 0
                }
            });
            return;
        }
        const applications = await prisma.loanApplication.findMany({
            where: { borrowerId: user.id }
        });
        const stats = {
            totalApplications: applications.length,
            pendingApplications: applications.filter(app => app.status === 'SUBMITTED' || app.status === 'UNDER_REVIEW').length,
            approvedApplications: applications.filter(app => app.status === 'APPROVED').length,
            rejectedApplications: applications.filter(app => app.status === 'REJECTED').length,
            totalRequested: applications.reduce((sum, app) => sum + app.requestedAmount, 0),
            totalApproved: applications
                .filter(app => app.status === 'APPROVED')
                .reduce((sum, app) => sum + app.requestedAmount, 0)
        };
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getLoanStats = getLoanStats;
//# sourceMappingURL=index.js.map