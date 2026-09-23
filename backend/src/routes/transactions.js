import { Router } from 'express';
import {
  getAllTransactions,
  getTransactionById,
  getTransactionByTxId,
  createTransaction,
  getTransactionStats
} from '../controllers/transactionsController.js';

const router = Router();

router.get('/', getAllTransactions);
router.get('/stats', getTransactionStats);
router.get('/tx/:txId', getTransactionByTxId);
router.get('/:id', getTransactionById);
router.post('/', createTransaction);

export default router;
