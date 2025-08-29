import { Router } from 'express';
import { getBorrowers, getBorrower, createBorrower, updateBorrowerKyc } from '../../controllers/borrowers';

const router = Router();

router.get('/', getBorrowers);
router.get('/:id', getBorrower);
router.post('/', createBorrower);
router.put('/:id/kyc', updateBorrowerKyc);

export default router;
