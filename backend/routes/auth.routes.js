import express from "express";
import { signup,login,logout,getUser} from "../contollers/auth.controller.js";
import { protectedRoute } from "../middleware/protectedRoute.js";

const router = express.Router();

router.get("/user", protectedRoute, getUser);
router.post("/signup",signup);
router.post("/login",login);
router.post("/logout",logout);

export default router;
