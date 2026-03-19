import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            unique: [true, "Username already taken"],
            required: true
        },

        email: {
            type: String,
            lowercase: true,
            unique: [true, "Account already exits with this email id."],

        },

        password: {
            type: String,
            required: true
        }
    },
    {timestamps: true}
);

export const User = mongoose.model("User", userSchema);