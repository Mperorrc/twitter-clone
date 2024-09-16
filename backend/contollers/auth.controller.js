import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

export const signup =  async (req,res)=>{
    try {
        const {fullName, username, email, password} = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({
                error:"Invalid Email!!"
            });
        }

        const existsUser = await User.findOne({username});
        if(existsUser){
            return res.status(400).json({
                error:"Username already exists!!"
            });
        }

        const existsEmail = await User.findOne({email});
        if(existsEmail){
            return res.status(400).json({
                error:"Email already exists!!"
            });
        }

        if(password.length<6){
            return res.status(400).json({
                error:"Password must be at least 6 characters long"
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt); 
        const newUser = new User({
            fullName,
            username,
            email,
            password:hashedPassword
        });
        if(newUser){
            generateTokenAndSetCookie(newUser._id,res);
            await newUser.save();

            return res.status(201).json({
                message:"User created successfully",
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                password: newUser.password,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg,
            });
        }
        else{
            return res.status(400).json({error:"Invalid user data"});
        }
    } catch (error) {
        console.log("Error in Signup controller", error.message),
        res.status(500).json({error:"Internal Server Error"});
    }
};

export const login =  async (req,res)=>{
    try {
        const {username,password} = req.body;
        if(!password||password.length<6){
            return res.status(400).json({
                error:"Password must be at least 6 characters long"
            })
        }
        
        const user = await User.findOne({username});
        const passwordCheck = await bcrypt.compare(password,user?.password || "");
        
        if(!user||!passwordCheck){
            return res.status(400).json({
                error:"Invalid Username or Password"
            });
        }
        
        generateTokenAndSetCookie(user._id,res);
        
        return res.status(201).json({
            message:"User logged in successfully",
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            password: user.password,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg,
        });

    } catch (error) {
        console.log("Error in Login controller", error.message),
        res.status(500).json({error:"Internal Server Error"});
    }

};

export const logout =  async (req,res)=>{
    try {
        res.cookie("jwt","",{maxAge:0});
        return res.status(200).json({message:"Logged out successfully"});
    } catch (error) {
        console.log("Error in Logout controller", error.message),
        res.status(500).json({error:"Internal Server Error"});
    }
};

export const getUser = async (req,res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        return res.status(200).json({
            user
        });
    } catch (error) {
        console.log("Error in getUser controller", error.message),
        res.status(500).json({error:"Internal Server Error"});
    }
}