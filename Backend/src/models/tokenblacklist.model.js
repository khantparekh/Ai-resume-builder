import mongoose from "mongoose";

const tokenBlackListSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: [true, "token is required to be added in blacklist"]
        }
    },
    { timestamps: true }
);

export const TokenBlackList = mongoose.model("TokenBlackList", tokenBlackListSchema);
