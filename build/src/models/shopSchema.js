import mongoose from "mongoose";
const shopSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    shopLogo: { type: String, required: false },
    shopName: { type: String, required: true },
    shopOwnerName: { type: String, required: true },
    shopEmail: {
        type: String,
        required: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please fill a valid email address",
        ],
        validate: {
            validator: async function (shopEmail) {
                const user = await Shop.findOne({ shopEmail });
                if (user) {
                    throw new Error("Email already exists in the database");
                }
            },
        },
    },
    password: { type: String, required: [false, "Password is required"] },
    shopAddress: { type: String, required: true },
    shopCity: { type: String, required: true },
    shopPhone: { type: String, required: true },
    role: {
        type: String,
        enum: ["super", "admin", "user"],
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
        required: true,
    },
    token: { type: String },
}, {
    timestamps: true,
});
const Shop = mongoose.model("shop", shopSchema);
export default Shop;
