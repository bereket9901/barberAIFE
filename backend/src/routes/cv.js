import { Router } from 'express';
import multer from 'multer';
import {
  processVideo,
  getJobStatus,
  getJobVideo,
  getJobTracks,
  checkHealth
} from '../controllers/cvController.js';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  }
});

// Health check
router.get('/health', checkHealth);

// Video processing
router.post('/video-test', upload.single('video'), processVideo);
router.get('/video-test/:jobId', getJobStatus);
router.get('/video-test/:jobId/video', getJobVideo);
router.get('/video-test/:jobId/tracks', getJobTracks);

export default router;
