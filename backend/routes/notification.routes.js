import express from "express";
import { protectedRoute } from "../middleware/protectedRoute.js";
import { deleteNotification, deleteNotifications, getNotifications } from "../contollers/notifcation.controller.js";

const router = express.Router();

router.get("/", protectedRoute, getNotifications);
router.delete("/", protectedRoute, deleteNotifications);
// router.delete("/:id", protectedRoute, deleteNotification);

export default router;