import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectedRoute = async (req,res,next) =>{
    try {
        const token = req.cookies.jwt;

        if(!token || token==undefined){
            return res.status(401).json({
                error:"Unauthorized access. You have to login first!!"
            });
        }
        
        const decoded  = jwt.verify(token,process.env.JWT_SECRET);
        
        if(!decoded){
            return res.status(401).json({
                error:"Unauthorized token. You have to login!!"
            });
        }
        
        const user = await User.findById(decoded.userId).select("-password");
        
        if(!user){
            return res.status(401).json({
                error:"User not found. You have to login!!"
            });
        }
        
        console.log("h1");
        req.user = user;
        next();
    } catch (error) {
        console.log("Error in protectedRoute middleware", error.message);
        return res.status(500).json({
            error: "Internal Server error"
        });
    }
}
