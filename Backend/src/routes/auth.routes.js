import { Router } from "express";
import { getCurrentUserController, loginUserController, logoutUserController, registerUserController } from "../controllers/auth.controller.js";
import { authUser } from "../middlewares/auth.middleware.js";

const authRouter = Router();

/**
 * @rout POST api/v1/auth/register
 * @description register a user
 * @access Public
 */
authRouter.post('/register', registerUserController);

/**
 * @rout POST api/v1/auth/login
 * @description login a user
 * @access Public
 */
authRouter.post('/login', loginUserController);

/**
 * @rout GET api/v1/auth/logout
 * @description logout a user and blacklist the token
 * @access Public
 */
authRouter.get('/logout', logoutUserController);

/**
 * @route GET api/v1/auth/current-user
 * @description get the current logged in user details
 * @access Private
 */
authRouter.get('/current-user', authUser, getCurrentUserController)

export default authRouter;