import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
//auth routes
import authRouter from "./routes/auth.routes.js";
app.use('/api/v1/auth', authRouter);

export {app};