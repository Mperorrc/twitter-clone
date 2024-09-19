import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

export const getAllPosts = async(req,res) =>{
    try {
        
        const posts = await Post.find().sort({createdAt: -1}).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select:"-password"
        });
        
        res.status(200).json(posts);

    } catch (error) {
        console.log("Error in fetching all posts: ", error.message);
        res.status(500).json({error: error.message});
    }
}

export const getAllLikedPosts = async(req,res) =>{
    
    const userId= req.params.id;
    
    try {
        
        const user = await User.findById(userId);

        if(!user){
            return res.status(400).json({error: "User not found"});
        }
        
        const posts = await Post.find({_id: {$in: user.likedPosts}})
        .populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select:"-password"
        });
        
        res.status(200).json(posts);

    } catch (error) {
        console.log("Error in fetching liked posts: ", error.message);
        res.status(500).json({error: error.message});
    }
}

export const getFollowerPosts = async(req,res) =>{
    
    const userId= req.user._id;

    try {
        
        const user = await User.findById(userId);

        if(!user){
            return res.status(400).json({error: "User not found"});
        }
        const posts = await Post.find({user: {$in: user.following}})
        .sort({createdAt : -1})
        .populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select:"-password"
        });
        
        res.status(200).json(posts);

    } catch (error) {
        console.log("Error in fetching Following posts: ", error.message);
        res.status(500).json({error: error.message});
    }
}

export const getUserPosts = async(req,res) =>{
    try {
        const username = req.params.username;

        const user = await User.findOne({username});
        if(!user){
            return res.status(400).json({error: "User not found"});
        }        

        const posts = await Post.find({user: user._id})
        .sort({createdAt : -1})
        .populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select:"-password"
        });
        
        res.status(200).json(posts);

    } catch (error) {
        console.log("Error in fetching Following posts: ", error.message);
        res.status(500).json({error: error.message});
    }
}

export const createPost = async (req,res) =>{
    try {
        
        const {text} = req.body;
        let {img} = req.body;

        const userId = req.user._id;

        const user = await User.findById(userId).select("-password");

        if(!user){
            return res.status(400).json({
                error: "User not Found"
            });
        }

        if(!text || !text.length){
            return res.status(400).json({
                error: "Post text content cannot be empty"
            });
        }

        if(img){
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url
        }

        const newPost = new Post({
            user:userId,
            text,
            img,
        });

        await newPost.save();

        res.status(201).json({
            message:"Post created successfully",
            newPost
        });

    } catch (error) {
        console.log("Error in creating Post: ", error.message);
        res.status(500).json({error: error.message});
    }
}

export const likeUnlikePost = async(req,res) =>{
    try {
        const postId = req.params.id;
        const userId = req.user._id;
        const post = await Post.findById(postId);

        if(!post){
            return res.status(400).json({
                error: "Post Not Found"
            });
        }

        const userLikedPost = post.likes.includes(userId);
        
        if(userLikedPost){
            await Post.updateOne({_id:postId},{$pull: {likes: userId}});
            await User.updateOne({_id:userId},{$pull: {likedPosts: postId}});

            const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
            
            return res.status(200).json(updatedLikes)
        }
        else{
            post.likes.push(userId);
            await post.save();
            await User.updateOne({_id:userId},{$push: {likedPosts: postId}});
            

            const notification = new Notification({
                from: userId,
                to: post.user,
                type:"like"
            });
            
            await notification.save();

            const updatedLikes = post.likes;

            res.status(200).json(updatedLikes)

        }

    } catch (error) {
        console.log("Error in creating Post: ", error.message);
        res.status(500).json({error: error.message});
    }
}

export const commentOnPost = async (req,res) => {
    try {
        const postId = req.params.id;
        const {text} = req.body;
        const post = await Post.findById(postId);

        if(!post){
            return res.status(400).json({
                error: "Post Not Found"
            });
        }

        if(!text||!text.length){
            return res.status(400).json({
                error: "Comment Cannot be Empty"
            });
        }

        const comment ={
            user: req.user._id,
            text,
        }

        post.comments.push(comment);

        await post.save();
        
        const updatedComments = post.comments;
        res.status(200).json(updatedComments);
        
    } catch (error) {
        console.log("Error in creating Post: ", error.message);
        res.status(500).json({error: error.message});
    }
}


export const deletePost = async (req,res) =>{
    try {
        const postId = req.params.id;
        console.log("CHECK",postId);
        const post = await Post.findById(postId);

        if(!post){
            return res.status(400).json({
                error: "Post Not Found"
            });
        }

        if(post.user.toString() !== req.user._id.toString()){
            return res.status(400).json({
                error: "Posts can only be deleted by the creator of the post"
            });
        }

        if(post.img){
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete(postId);
        res.status(200).json({
            message:"Post Deleted Successfully"
        })
        
    } catch (error) {
        console.log("Error in deleting Post: ", error.message);
        res.status(500).json({error: error.message});
    }
}