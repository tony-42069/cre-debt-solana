import { Router } from 'express';
import { getPlatformConfig, updatePlatformConfig, getPlatformStats } from '../../controllers/platform';

const router = Router();

router.get('/config', getPlatformConfig);
router.put('/config', updatePlatformConfig);
router.get('/stats', getPlatformStats);

export default router;
