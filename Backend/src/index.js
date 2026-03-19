import 'dotenv/config';
import { app } from "./app.js";
import connectDB from './db/index.js';

connectDB()
.then(() => {
    app.on("error", (error) => {
        console.log('Error: ',error);
        throw error;
    });

    app.listen(process.env.PORT || 3000, () => {
        console.log("Server is running at PORT: ",process.env.PORT);
    }) 
})
.catch((error) => {
    console.log("MongoDB connection failed !!", error)
})