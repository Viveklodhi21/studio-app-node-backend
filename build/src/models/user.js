import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please fill a valid email address",
        ],
        validate: {
            validator: async function (email) {
                const user = await User.findOne({ email });
                if (user) {
                    throw new Error("Email already exists in the database");
                }
            },
        },
    },
    password: { type: String, required: [true, "Password is required"] },
    address: { type: String, required: true },
    phone: { type: Number, required: true },
    role: {
        type: String,
        enum: ["super", "admin", "user"],
        required: true,
    },
    token: { type: String },
}, {
    timestamps: true,
});
const User = mongoose.model("user", userSchema);
export default User;
