import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategories,
  updateCategory
} from "../controllers/categoryController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getCategories);
router.get("/all", protect, adminOnly, getAllCategories);
router.post("/", protect, adminOnly, createCategory);
router.put("/:id", protect, adminOnly, updateCategory);

export default router;
