"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUpcomingPayments = exports.getPaymentHistory = exports.processPayment = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const processPayment = async (req, res, next) => {
    try {
        const { loanId, amount, paymentMethod, walletAddress, dueDate } = req.body;
        if (!loanId || !amount || !paymentMethod || !walletAddress) {
            return res.status(400).json({
                success: false,
                error: 'Missing required payment information'
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
        const loan = await prisma.loan.findFirst({
            where: {
                id: loanId,
                borrowerId: user.id
            }
        });
        if (!loan) {
            return res.status(404).json({
                success: false,
                error: 'Loan not found or access denied'
            });
        }
        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid payment amount'
            });
        }
        const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const paymentResult = await simulatePaymentProcessing({
            loanId,
            amount,
            paymentMethod,
            walletAddress,
            transactionId
        });
        if (!paymentResult.success) {
            return res.status(400).json({
                success: false,
                error: paymentResult.error || 'Payment processing failed'
            });
        }
        const payment = await prisma.payment.create({
            data: {
                paymentId: transactionId,
                loanId: loan.id,
                amount,
                paymentType: 'PRINCIPAL',
                paymentMethod: paymentMethod === 'usdc' ? 'USDC_TRANSFER' : 'WIRE_TRANSFER',
                status: 'COMPLETED',
                processedAt: new Date(),
                confirmedAt: new Date(),
                dueDate: new Date(dueDate),
                paidDate: new Date(),
                principalPortion: amount * 0.8,
                interestPortion: amount * 0.2,
                blockchainTx: paymentResult.blockchainTx || null
            }
        });
        await prisma.loan.update({
            where: { id: loan.id },
            data: {
                remainingBalance: Math.max(0, loan.remainingBalance - amount),
                totalPaid: loan.totalPaid + amount,
                lastPaymentDate: new Date(),
                updatedAt: new Date()
            }
        });
        res.json({
            success: true,
            data: {
                transactionId,
                paymentId: payment.id,
                amount,
                status: 'COMPLETED',
                processedAt: payment.processedAt,
                blockchainTx: paymentResult.blockchainTx
            }
        });
    }
    catch (error) {
        console.error('Error processing payment:', error);
        next(error);
    }
};
exports.processPayment = processPayment;
const getPaymentHistory = async (req, res, next) => {
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
        const payments = await prisma.payment.findMany({
            where: {
                loan: {
                    borrowerId: user.id
                }
            },
            include: {
                loan: {
                    select: {
                        loanId: true,
                        application: {
                            select: {
                                property: {
                                    select: {
                                        address: true,
                                        city: true,
                                        state: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({
            success: true,
            data: payments
        });
    }
    catch (error) {
        console.error('Error fetching payment history:', error);
        next(error);
    }
};
exports.getPaymentHistory = getPaymentHistory;
const getUpcomingPayments = async (req, res, next) => {
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
        const upcomingPayments = await prisma.payment.findMany({
            where: {
                loan: {
                    borrowerId: user.id
                },
                status: 'PENDING',
                dueDate: {
                    gte: new Date()
                }
            },
            include: {
                loan: {
                    select: {
                        loanId: true,
                        application: {
                            select: {
                                property: {
                                    select: {
                                        address: true,
                                        city: true,
                                        state: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { dueDate: 'asc' }
        });
        res.json({
            success: true,
            data: upcomingPayments
        });
    }
    catch (error) {
        console.error('Error fetching upcoming payments:', error);
        next(error);
    }
};
exports.getUpcomingPayments = getUpcomingPayments;
async function simulatePaymentProcessing(paymentData) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const isSuccess = Math.random() > 0.1;
    if (isSuccess) {
        return {
            success: true,
            blockchainTx: `SOL_TX_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            transactionId: paymentData.transactionId
        };
    }
    else {
        return {
            success: false,
            error: 'Payment processing failed - please try again'
        };
    }
}
//# sourceMappingURL=index.js.map