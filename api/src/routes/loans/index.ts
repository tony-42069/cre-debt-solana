import { Router } from 'express';
import { getLoans, getLoan, createLoan, approveLoan, fundLoan, processPayment } from '../../controllers/loans';

const router = Router();

router.get('/', getLoans);
router.get('/:id', getLoan);
router.post('/', createLoan);
router.put('/:id/approve', approveLoan);
router.put('/:id/fund', fundLoan);
router.post('/:id/payment', processPayment);

export default router;
