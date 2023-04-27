import express from 'express';
import userRouter from './user.js';
import shopUserRouter from './shopUserRouter.js';
import orderRouter from './order.js';
import transactionRouter from './transaction.js';

const app = express();

app.use('/user', userRouter);
app.use('/shopuser', shopUserRouter);
app.use('/order', orderRouter);
app.use('/transaction', transactionRouter);

export default app;
