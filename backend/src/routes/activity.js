import { Router } from 'express';
import {
  getActivityLog,
  addActivity,
  clearActivityLog
} from '../controllers/activityController.js';

const router = Router();

router.get('/', getActivityLog);
router.post('/', addActivity);
router.delete('/', clearActivityLog);

export default router;
