import jwt from "jsonwebtoken";
import { TokenBlackList } from "../models/tokenblacklist.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const authUser = asyncHandler(async (req, res, next) => {
    const token = req.cookies.token

    if(!token){
        throw new ApiError(401, "Token is not provided");
    }

    const isTokenBlackListed = await TokenBlackList.findOne({ token });
    if(isTokenBlackListed){
        throw new ApiError(401, "Token is invalid");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        throw new ApiError(401, "Invalid token");
    }
});

export {authUser}