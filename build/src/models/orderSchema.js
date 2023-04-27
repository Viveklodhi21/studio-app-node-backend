import mongoose from "mongoose";
const orderSchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true,
    },
    customerId: { type: String, required: true },
    shopLogo: { type: String, required: false },
    customerName: { type: String, required: true },
    customerEmail: {
        type: String,
        required: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please fill a valid email address",
        ],
        validate: {
            validator: async function (shopEmail) {
                const user = await Order.findOne({ shopEmail });
                if (user) {
                    throw new Error("Email already exists in the database");
                }
            },
        },
    },
    customerAddress: { type: String, required: true },
    customerPhone: { type: String, required: true },
    orderDetails: { type: Array, required: true },
    grandTotal: { type: Number, required: true },
    discountOnTotal: { type: Number, required: false },
    // totalDiscount: { type: Number, required: true },
    finalAmount: { type: Number, required: true },
    advancePayment: { type: Number, required: false },
    remainingPayment: { type: Number, required: false },
    note: { type: String, required: false },
    measurement: { type: String, required: false },
    paymentMode: { type: String, required: false, enum: ["online", "cash"] },
    orderStatus: {
        type: String,
        required: false,
        enum: ["progress", "cancelled", "completed"],
    },
}, {
    timestamps: true,
});
const Order = mongoose.model("order", orderSchema);
export default Order;
