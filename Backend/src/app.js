import express from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());
//auth routes
import authRouter from "./routes/auth.routes.js";
app.use('/api/v1/auth', authRouter);

export {app};