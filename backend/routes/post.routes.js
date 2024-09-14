import express from "express";
import { protectedRoute } from "../middleware/protectedRoute.js";
import { createPost,deletePost,commentOnPost, likeUnlikePost,getAllPosts, getAllLikedPosts, getFollowerPosts, getUserPosts } from "../contollers/post.controller.js";

const router = express.Router();

router.get('/all',protectedRoute,getAllPosts);
router.get('/likedPosts',protectedRoute,getAllLikedPosts);
router.get('/following',protectedRoute,getFollowerPosts);
router.get('/user/:username',protectedRoute,getUserPosts);
router.post('/create',protectedRoute,createPost);
router.post('/like/:id',protectedRoute,likeUnlikePost);
router.post('/comment/:id',protectedRoute,commentOnPost);
router.delete('/:id',protectedRoute,deletePost);

export default router;