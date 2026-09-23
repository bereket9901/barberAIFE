import { Router } from 'express';
import {
  getAllCameras,
  getCameraById,
  getCameraByChair,
  updateCameraStatus,
  getSystemStatus
} from '../controllers/camerasController.js';

const router = Router();

router.get('/', getAllCameras);
router.get('/status', getSystemStatus);
router.get('/:id', getCameraById);
router.get('/chair/:chairId', getCameraByChair);
router.patch('/:id', updateCameraStatus);

export default router;
