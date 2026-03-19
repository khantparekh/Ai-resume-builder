import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { TokenBlackList } from "../models/tokenblacklist.model.js";

/**
 * @name registerUserController
 * @description register a user, expect username, email and password in the request body
 * @access Public
 */
const registerUserController = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if(!username || !email || !password){
        throw new ApiError(400, "Please provide username, email and password");
    }

    const userExists = await User.findOne({
        $or: [{username}, {email}]
    });

    if(userExists){
        throw new ApiError(400, "User already exists with this username or email");
    }

    const hash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
        username,
        email,
        password: hash
    });

    const token = jwt.sign(
        {
            id: newUser._id,
            username: newUser.username
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );

    res.cookie("token", token);

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email
            },
            "User registered successfully"
        )
    );
});

/**
 * @name loginUserController
 * @description login a user, expect email and password in the request body
 * @access Public
 */

const loginUserController = asyncHandler(async (req, res) => {
    const {email, password} = req.body;

    if(!email || !password){
        throw new ApiError(400, "Email and Password required");
    }

    const user = await User.findOne({email});

    if(!user){
        throw new ApiError(400, "Invalid email address");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid password");
    }

    const token = jwt.sign(
        {
            id: user._id,
            username: user.username
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '1d'
        }
    );

    res.cookie("token", token);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                username: user.username,
                id: user._id,
                email: user.email
            },
            "User logged in successfully"
        )
    );
});

/**
 * @name logoutUserController
 * @description logout a user by clearing the token cookie and adding the token to blacklist
 * @access Private
 */

const logoutUserController = asyncHandler(async (req, res) => {
    const token = req.cookies.token;

    if(token){
        await TokenBlackList.create({token});
    }

    res.clearCookie("token");

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "User logged out successfully"
        )
    );
});

/**
 * @name getCurrentUserController
 * @description get the current logged in user details
 * @access Private
 */

const getCurrentUserController = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {
                id: user._id,
                username: user.username,
                email: user.email
            },
            "User details fetched successfully"
        )
    );
});

export {
    registerUserController,
    loginUserController,
    logoutUserController,
    getCurrentUserController
}