import express from 'express';
import {
  addOrder,
  getOrders,
  editOrders,
  deleteOrder
} from '../controllers/orderController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/addorder', auth, addOrder);
router.get('/getorders/:shopId', auth, getOrders);
router.put('/editorder/:id', auth, editOrders);
router.delete('/deleteorder/:id', auth, deleteOrder);
export default router;
