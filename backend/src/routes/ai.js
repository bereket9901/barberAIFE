import { Router } from 'express';
import {
  simulateDetection,
  runDemoSimulation,
  getConfidenceThreshold
} from '../controllers/aiController.js';

const router = Router();

router.post('/detect', simulateDetection);
router.post('/demo', runDemoSimulation);
router.get('/threshold', getConfidenceThreshold);

export default router;
