import express from "express";
import { signup,login,logout } from "../contollers/auth.controller.js";

const router = express.Router();

router.get("/signup",signup);

router.get("/login",login);

router.get("/logout",logout);

export default router;
