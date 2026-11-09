import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
    "http://localhost:5173",
    "https://careercompat.vercel.app"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.get('/api/ping', (req, res) => {
  res.json({
    status:    'ok',
    message:   'Server reachable ✅',
    timestamp: new Date().toISOString(),
    clientUrl: process.env.CLIENT_URL,
  });
});

//auth routes
import authRouter from "./routes/auth.routes.js";
app.use('/api/v1/auth', authRouter);

//interview routes
import interviewRouter from "./routes/interview.routes.js";
app.use('/api/v1/interview', interviewRouter);

export {app};