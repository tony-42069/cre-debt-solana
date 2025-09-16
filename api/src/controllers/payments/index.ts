import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const processPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { loanId, amount, paymentMethod, walletAddress, dueDate } = req.body

    if (!loanId || !amount || !paymentMethod || !walletAddress) {
      res.status(400).json({
        success: false,
        error: 'Missing required payment information'
      })
      return
    }

    // Get user by wallet address
    const user = await prisma.user.findUnique({
      where: { walletAddress }
    })

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      })
      return
    }

    // Verify loan exists and belongs to user
    const loan = await prisma.loan.findFirst({
      where: {
        id: loanId,
        borrowerId: user.id
      }
    })

    if (!loan) {
      res.status(404).json({
        success: false,
        error: 'Loan not found or access denied'
      })
      return
    }

    // Check if payment amount is valid
    if (amount <= 0) {
      res.status(400).json({
        success: false,
        error: 'Invalid payment amount'
      })
      return
    }

    // Generate transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // For now, simulate payment processing
    // In production, this would integrate with actual payment processors
    const paymentResult = await simulatePaymentProcessing({
      loanId,
      amount,
      paymentMethod,
      walletAddress,
      transactionId
    })

    if (!paymentResult.success) {
      res.status(400).json({
        success: false,
        error: paymentResult.error || 'Payment processing failed'
      })
      return
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        paymentId: transactionId,
        loanId: loan.id,
        amount,
        paymentType: 'PRINCIPAL', // This would be calculated based on loan terms
        paymentMethod: paymentMethod === 'usdc' ? 'USDC_TRANSFER' : 'WIRE_TRANSFER',
        status: 'COMPLETED',
        processedAt: new Date(),
        confirmedAt: new Date(),
        dueDate: new Date(dueDate),
        paidDate: new Date(),
        principalPortion: amount * 0.8, // Simplified calculation
        interestPortion: amount * 0.2,  // Simplified calculation
        blockchainTx: paymentResult.blockchainTx || null
      }
    })

    // Update loan balance
    await prisma.loan.update({
      where: { id: loan.id },
      data: {
        remainingBalance: Math.max(0, loan.remainingBalance - amount),
        totalPaid: loan.totalPaid + amount,
        lastPaymentDate: new Date(),
        updatedAt: new Date()
      }
    })

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
    })
  } catch (error) {
    console.error('Error processing payment:', error)
    next(error)
  }
}

export const getPaymentHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { walletAddress } = req.query

    if (!walletAddress || typeof walletAddress !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Wallet address is required'
      })
      return
    }

    // Get user by wallet address
    const user = await prisma.user.findUnique({
      where: { walletAddress }
    })

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      })
      return
    }

    // Get payment history
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
    })

    res.json({
      success: true,
      data: payments
    })
  } catch (error) {
    console.error('Error fetching payment history:', error)
    next(error)
  }
}

export const getUpcomingPayments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { walletAddress } = req.query

    if (!walletAddress || typeof walletAddress !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Wallet address is required'
      })
      return
    }

    // Get user by wallet address
    const user = await prisma.user.findUnique({
      where: { walletAddress }
    })

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      })
      return
    }

    // Get upcoming payments
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
    })

    res.json({
      success: true,
      data: upcomingPayments
    })
  } catch (error) {
    console.error('Error fetching upcoming payments:', error)
    next(error)
  }
}

// Simulate payment processing (replace with actual payment processor integration)
async function simulatePaymentProcessing(paymentData: any) {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Simulate success/failure (90% success rate)
  const isSuccess = Math.random() > 0.1

  if (isSuccess) {
    return {
      success: true,
      blockchainTx: `SOL_TX_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      transactionId: paymentData.transactionId
    }
  } else {
    return {
      success: false,
      error: 'Payment processing failed - please try again'
    }
  }
}
