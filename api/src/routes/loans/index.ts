import { Router } from 'express';
import {
  getLoanApplications,
  getLoanApplication,
  createLoanApplication,
  updateLoanApplication,
  submitLoanApplication,
  approveLoanApplication,
  rejectLoanApplication,
  getLoanStats
} from '../../controllers/loans/index';

const router = Router();

// Get loan applications for a user
router.get('/', getLoanApplications);

// Get loan application statistics
router.get('/stats', getLoanStats);

// Get specific loan application
router.get('/:id', getLoanApplication);

// Create new loan application
router.post('/', createLoanApplication);

// Update loan application
router.put('/:id', updateLoanApplication);

// Submit loan application for review
router.post('/:id/submit', submitLoanApplication);

// Approve loan application
router.post('/:id/approve', approveLoanApplication);

// Reject loan application
router.post('/:id/reject', rejectLoanApplication);

export default router;
