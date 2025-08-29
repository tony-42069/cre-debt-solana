"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getDashboardStats = async (req, res, next) => {
    try {
        const { walletAddress } = req.query;
        if (!walletAddress || typeof walletAddress !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Wallet address is required'
            });
        }
        const user = await prisma.user.findUnique({
            where: { walletAddress }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        const totalProperties = await prisma.property.count({
            where: { ownerId: user.id }
        });
        const totalLoans = await prisma.loanApplication.count({
            where: { borrowerId: user.id }
        });
        const activeLoans = await prisma.loan.count({
            where: {
                borrowerId: user.id,
                status: {
                    in: ['ACTIVE', 'APPROVED', 'FUNDED']
                }
            }
        });
        const loans = await prisma.loan.findMany({
            where: {
                borrowerId: user.id,
                status: {
                    in: ['ACTIVE', 'APPROVED', 'FUNDED']
                }
            },
            select: { principalAmount: true }
        });
        const totalLoanValue = loans.reduce((sum, loan) => sum + loan.principalAmount, 0);
        const nextPayment = await prisma.payment.findFirst({
            where: {
                loan: {
                    borrowerId: user.id
                },
                status: 'PENDING',
                dueDate: {
                    gte: new Date()
                }
            },
            orderBy: { dueDate: 'asc' },
            select: {
                amount: true,
                dueDate: true
            }
        });
        const dashboardStats = {
            totalProperties,
            totalLoans,
            activeLoans,
            totalLoanValue,
            nextPaymentDue: nextPayment?.dueDate?.toISOString() || null,
            nextPaymentAmount: nextPayment?.amount || 0
        };
        res.json({
            success: true,
            data: dashboardStats
        });
    }
    catch (error) {
        console.error('Error fetching dashboard stats:', error);
        next(error);
    }
};
exports.getDashboardStats = getDashboardStats;
//# sourceMappingURL=index.js.map