import { Response } from 'express';

import { successResponse, validationError, errorResponse } from '../helpers/api-response.js';

import Order from '../models/orderSchema.js';
import Transaction from '../models/transactionSchema.js';
import ShopUser from '../models/shopUserSchema.js';

// create an api to add transaction data
export const addTransaction = async (req: any, res: Response) => {
  let { shopId, orderId, customerName, amount, mode } = req.body;

  const TransactionData = new Transaction({
    shopId,
    orderId,
    customerName,
    amount,
    mode,
  });

  try {
    const shopExists = await ShopUser.findOne({ shopId });
    if (!shopExists) {
      return validationError(res, 'Shop with the given shopId does not exist');
    }

    const OrderExists = await Order.findOne({ _id: orderId });
    if (!OrderExists) {
      return validationError(res, 'Order with the given orderId does not exist');
    }

    const saveTransactionData = await TransactionData.save();
    return successResponse(res, 'Transaction added successfully', saveTransactionData);
  } catch (error: any) {
    console.log('errorrr', error);
    return validationError(res, error.message);
  }
};

// create an api to get transaction data
export const getTransactions = async (req: any, res: Response) => {
  try {
    const per_page = parseInt(req.query.per_page);
    const current_page = parseInt(req.query.current_page);
    const { shopId } = req.params;
    const shopExists = await ShopUser.findOne({ shopId });
    if (!shopExists) {
      return validationError(res, 'Shop with the given shopId does not exist');
    }
    const transactions = await Transaction.find({ shopId })
      .limit(per_page)
      .skip((current_page - 1) * per_page);
    return successResponse(res, 'Transactions fetched successfully', transactions);
  } catch (error: any) {
    console.log('errorrr', error);
    return validationError(res, error.message);
  }
};

// create an api to edit transaction data
export const editTransaction = async (req: any, res: Response) => {
  const { id } = req.params;
  const { customerName, amount, mode } = req.body;

  try {
    const TransactionExists = await Transaction.findOne({ _id: id });
    if (!TransactionExists) {
      return validationError(res, 'Transaction with the given id does not exist');
    }
    const updateTransaction = await Transaction.findByIdAndUpdate(
      id,
      { customerName, amount, mode },
      { new: true }
    );
    return successResponse(res, 'Transaction updated successfully', updateTransaction);
  } catch (error: any) {
    console.log('errorrr', error);
    return validationError(res, error.message);
  }
};

// create an api to delete transaction data
export const deleteTransaction = async (req: any, res: Response) => {
  const { id } = req.params;

  try {
    const TransactionExists = await Transaction.findOne({ _id: id });
    if (!TransactionExists) {
      return validationError(res, 'Transaction with the given id does not exist');
    }
    await Transaction.findByIdAndDelete(id);
    return successResponse(res, 'Transaction deleted successfully', null);
  } catch (error: any) {
    console.log('errorrr', error);
    return validationError(res, error.message);
  }
};
