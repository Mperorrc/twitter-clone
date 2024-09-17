import Notification from "../models/notification.model.js";
import bcrypt from "bcryptjs";
import {v2 as cloudinary} from "cloudinary";

import User from "../models/user.model.js";

export const getUserProfile = async (req,res) =>{
    const {username} = req.params;
    try {
        const user = await User.findOne({username}).select("-password");
        if(!user){
            return res.status(400).json({error: "User not found"});
        }
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getting user profile: ", error.message);
        res.status(400).json({error: error.message});
    }
}

export const  followUnfollowUser =  async (req,res)=>{
    const {id} = req.params;
    try {
        
        if(id === req.user._id.toString()){
            return res.status(400).json({error: "You can't follow yourself"});
        }

        const userTofollowUnfollow = await User.findById(id).select("-password");
        const currentUser = await User.findById(req.user._id);

        if(!userTofollowUnfollow){
            return res.status(400).json({error: "User to follow/unfollow not found"});
        }
        
        if(!currentUser){
            return res.status(400).json({error: "User not found"});
        }

        const isFollowing = currentUser.following.includes(id);

        if(isFollowing){
            await User.findByIdAndUpdate(id,{ $pull: {followers: req.user._id}});
            await User.findByIdAndUpdate(req.user._id,{ $pull: {following: id}});

            // TODO :
            // REMOVE NOTIFICATION IF USER UNFOLLOWS BEFORE THE OTHER USER READS THE NOTIFICATION
            // RETURN USERID ON SUCCESS

            res.status(200).json({message:"Unfollowed successfully"});
        }
        else{
            await User.findByIdAndUpdate(id,{ $push: {followers: req.user._id}});
            await User.findByIdAndUpdate(req.user._id,{ $push: {following: id}});

            const newNotification = new Notification({
                from:req.user._id,
                to: id,
                type: "follow"
            });

            await newNotification.save();

            res.status(201).json({message:"Followed successfully"});
        }
    } catch (error) {
        console.log("Error in following/unfollowing user: ", error.message);
        res.status(400).json({error: error.message});
    }
}

export const getSuggestedUsers = async (req,res) =>{
    try {
        
        const userId = req.user._id;

        const usersFollowedByMe = await User.findById(userId).select("following");

        const users = await User.aggregate([
            {
                $match:{
                    _id:{$ne: userId}
                }
            },
            {
                $sample:{size:10}
            }
        ]);

        const filteredUsers = users.filter(user => !usersFollowedByMe.following.includes(user._id));
        const suggestedUsers = filteredUsers.slice(0,4);

        suggestedUsers.forEach(user=> user.password=null);
        
        res.status(200).json(suggestedUsers);

    } catch (error) {
        console.log("Error in suggest user: ", error.message);
        res.status(400).json({error: error.message});
    }
}

export const updateUser = async (req,res) => {
    const {fullName, username, email,currentPassword, newPassword, bio, link} = req.body;
    let {profileImg, coverImg} = req.body;
    
    const userId = req.user._id;
    try {

        let user = await User.findById(userId);

        if(!user){
            return res.status(400).json({error: "User not found"});
        }

        if((!currentPassword && newPassword) || (currentPassword && !newPassword)){
            return res.status(400).json({ error: "Password cannot be null"});
        }

        if(currentPassword && newPassword){
            const passwordCheck = await bcrypt.compare(currentPassword,user.password);
            
            if(!passwordCheck){
                return res.status(400).json({
                    error: "Current password is incorrect"
                });
            }
    
            if(newPassword.length<6){
                return res.status(400).json({
                    error: "Password must be at least 6 characters long"
                });
            }
    
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword,salt);
        }

        if(profileImg){
            if(user.profileImg){
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadedResponse.secure_url;

        }

        if(coverImg){
            if(user.coverImg){
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadedResponse.secure_url;
        }

        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.bio = bio || user.bio;
        user.username = username || user.username;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        user = await user.save();

        user.password = null;

        return res.status(201).json(user);
        
    } catch (error) {
        console.log("Error in suggest user: ", error.message);
        res.status(400).json({error: error.message});
    }
}