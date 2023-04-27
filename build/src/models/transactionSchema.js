import mongoose from 'mongoose';
const transactionSchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true,
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    customerName: { type: String, required: true },
    amount: { type: Number, required: true },
    mode: { type: String, required: false, enum: ['online', 'cash'] },
}, {
    timestamps: true,
});
const Transaction = mongoose.model('transaction', transactionSchema);
export default Transaction;
