import { Router } from 'express'
import { getDashboardStats } from '../../controllers/dashboard'

const router = Router()

// GET /api/dashboard/stats?walletAddress=...
router.get('/stats', getDashboardStats)

export default router
