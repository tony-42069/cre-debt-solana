import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { walletAddress } = req.query

    if (!walletAddress || typeof walletAddress !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Wallet address is required'
      })
    }

    // Get user by wallet address
    const user = await prisma.user.findUnique({
      where: { walletAddress }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Get properties count
    const totalProperties = await prisma.property.count({
      where: { ownerId: user.id }
    })

    // Get loan applications count
    const totalLoans = await prisma.loanApplication.count({
      where: { borrowerId: user.id }
    })

    // Get active loans count
    const activeLoans = await prisma.loan.count({
      where: {
        borrowerId: user.id,
        status: {
          in: ['ACTIVE', 'APPROVED', 'FUNDED']
        }
      }
    })

    // Get total loan value
    const loans = await prisma.loan.findMany({
      where: {
        borrowerId: user.id,
        status: {
          in: ['ACTIVE', 'APPROVED', 'FUNDED']
        }
      },
      select: { principalAmount: true }
    })

    const totalLoanValue = loans.reduce((sum, loan) => sum + loan.principalAmount, 0)

    // Get next payment due
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
    })

    const dashboardStats = {
      totalProperties,
      totalLoans,
      activeLoans,
      totalLoanValue,
      nextPaymentDue: nextPayment?.dueDate?.toISOString() || null,
      nextPaymentAmount: nextPayment?.amount || 0
    }

    res.json({
      success: true,
      data: dashboardStats
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    next(error)
  }
}
