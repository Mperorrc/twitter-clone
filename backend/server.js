import express from "express";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import {v2 as cloudinary} from "cloudinary";

import dotenv from "dotenv";

import cookieParser from "cookie-parser";
import connectMongoDB from "./db/connect.db.js";

dotenv.config();
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use("/api/auth",authRoutes);
app.use("/api/user",userRoutes);

app.listen(PORT,()=>{
    console.log(`Server running on Port ${PORT}`);
    connectMongoDB();
});