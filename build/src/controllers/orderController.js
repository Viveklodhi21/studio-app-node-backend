import mongoose from 'mongoose';
import { successResponse, validationError } from '../helpers/api-response.js';
import Order from '../models/orderSchema.js';
import Transaction from '../models/transactionSchema.js';
export const addOrder = async (req, res) => {
    let { shopId, customerId, shopLogo, customerName, customerEmail, customerAddress, customerPhone, orderDetails, grandTotal, discountOnTotal, totalDiscount, finalAmount, advancePayment, remainingPayment, notes, measurement, paymentMode, orderStatus, } = req.body;
    const OrderData = new Order({
        shopId,
        customerId,
        shopLogo,
        customerName,
        customerEmail,
        customerAddress,
        customerPhone,
        orderDetails,
        grandTotal,
        discountOnTotal,
        totalDiscount,
        finalAmount,
        advancePayment,
        remainingPayment,
        notes,
        measurement,
        paymentMode,
        orderStatus,
    });
    try {
        const saveOrderData = await OrderData.save();
        const TransactionData = new Transaction({
            shopId,
            orderId: saveOrderData._id,
            customerName,
            amount: finalAmount,
            mode: paymentMode,
        });
        await TransactionData.save();
        // const pdfDoc = await generateInvoice(saveOrderData);
        return successResponse(res, 'Order created and PDF also generated', saveOrderData);
    }
    catch (error) {
        console.log('errorrr', error);
        return validationError(res, error.message);
    }
};
export const getOrders = async (req, res) => {
    try {
        const per_page = parseInt(req.query?.per_page);
        const current_page = parseInt(req.query?.current_page);
        const orders = await Order.find()
            .limit(per_page)
            .skip((current_page - 1) * per_page);
        const numOfOrders = await Order.count();
        return successResponse(res, 'Shop found successfully', {
            orders,
            current_page,
            total_pages: Math.ceil(numOfOrders / per_page),
            total_entries: numOfOrders,
        });
    }
    catch (error) {
        validationError(res, error.message);
    }
};
export const editOrders = async (req, res) => {
    let { shopId, customerId, shopLogo, customerName, customerEmail, customerAddress, customerPhone, orderDetails, grandTotal, discountOnTotal, totalDiscount, finalAmount, advancePayment, remainingPayment, notes, measurement, paymentMode, orderStatus, } = req.body;
    const OrderData = {
        shopId,
        customerId,
        shopLogo,
        customerName,
        customerEmail,
        customerAddress,
        customerPhone,
        orderDetails,
        grandTotal,
        discountOnTotal,
        totalDiscount,
        finalAmount,
        advancePayment,
        remainingPayment,
        notes,
        measurement,
        paymentMode,
        orderStatus,
    };
    try {
        const objectId = mongoose.Types.ObjectId;
        const orderExists = await Order.findOne({ _id: new objectId(req.params.id) });
        if (!orderExists) {
            return validationError(res, 'Order does not exist');
        }
        const updatedOrder = await Order.findOneAndUpdate({ _id: req.params.id }, OrderData, {
            new: true,
        });
        successResponse(res, 'Order updated successfully', updatedOrder);
    }
    catch (error) {
        validationError(res, error.message);
    }
};
export const deleteOrder = async (req, res) => {
    try {
        await Order.findOneAndDelete({ _id: req.params.id });
        successResponse(res, 'Order deleted successfully', '');
    }
    catch (error) {
        validationError(res, error.message);
    }
};
