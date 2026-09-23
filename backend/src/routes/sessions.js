import { Router } from 'express';
import {
  getAllSessions,
  getSessionById,
  getSessionsByChair,
  createSession,
  addDetectedService,
  updateDetectedServiceStatus,
  completeSession
} from '../controllers/sessionsController.js';

const router = Router();

router.get('/', getAllSessions);
router.get('/:id', getSessionById);
router.get('/chair/:chairId', getSessionsByChair);
router.post('/', createSession);
router.post('/:sessionId/detected-services', addDetectedService);
router.patch('/detected-services/:serviceId', updateDetectedServiceStatus);
router.post('/:id/complete', completeSession);

export default router;
