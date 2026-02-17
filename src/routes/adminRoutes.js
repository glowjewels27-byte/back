import express from "express";
import { getDashboardStats, listUsers, toggleBlockUser } from "../controllers/adminController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", protect, adminOnly, getDashboardStats);
router.get("/users", protect, adminOnly, listUsers);
router.put("/users/:id/toggle-block", protect, adminOnly, toggleBlockUser);

export default router;
