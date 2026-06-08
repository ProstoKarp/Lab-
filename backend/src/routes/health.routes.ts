import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

const router = Router();

const healthController = new HealthController();

// Health check
router.get('/', (req, res) => {
  healthController.check(req, res);
});

export default router;
