import express from 'express';
import {
  register,
  login,
  getCurrentUser,
  getAllUsers,
  updateUser,
  deleteUser
} from '../controllers/authController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require authentication)
router.get('/me', authenticateToken, getCurrentUser);

// Admin-only routes
router.get('/', authenticateToken, requireAdmin, getAllUsers);
router.put('/:id', authenticateToken, requireAdmin, updateUser);
router.delete('/:id', authenticateToken, requireAdmin, deleteUser);

export default router;
