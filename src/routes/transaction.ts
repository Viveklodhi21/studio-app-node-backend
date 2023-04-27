import express from 'express';
import {
  addTransaction,
  getTransactions,
  editTransaction,
  deleteTransaction,
} from '../controllers/transactionController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/add', auth, addTransaction);
router.get('/list/:shopId', auth, getTransactions);
router.patch('/edit/:id', auth, editTransaction);
router.delete('/delete/:id', auth, deleteTransaction);
export default router;
