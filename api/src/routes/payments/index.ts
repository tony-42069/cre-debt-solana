import { Router } from 'express'
import { processPayment, getPaymentHistory, getUpcomingPayments } from '../../controllers/payments'

const router = Router()

// POST /api/payments/process - Process a payment
router.post('/process', processPayment)

// GET /api/payments/history?walletAddress=... - Get payment history
router.get('/history', getPaymentHistory)

// GET /api/payments/upcoming?walletAddress=... - Get upcoming payments
router.get('/upcoming', getUpcomingPayments)

export default router
