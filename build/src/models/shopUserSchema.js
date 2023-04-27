import mongoose from "mongoose";
const shopUserSchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true,
    },
    profilePicture: { type: String, required: false },
    shopUserName: { type: String, required: true },
    shopUserEmail: {
        type: String,
        required: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please fill a valid email address",
        ],
        validate: {
            validator: async function (email) {
                const shopUser = await ShopUser.findOne({ email });
                if (shopUser) {
                    throw new Error("Email already exists in the database");
                }
            },
        },
    },
    password: { type: String, required: [false, "Password is required"] },
    shopUserAddress: { type: String, required: true },
    shopUserCity: { type: String, required: true },
    shopUserPhone: { type: String, required: true },
    role: {
        type: String,
        enum: ["super", "admin", "user"],
        required: true,
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
        required: true,
    },
    token: { type: String },
}, {
    timestamps: true,
});
const ShopUser = mongoose.model("shopUser", shopUserSchema);
export default ShopUser;
