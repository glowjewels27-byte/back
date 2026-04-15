import express from "express";
import { createNfcExperience, getAdminNfcExperiences, getPublicNfcExperience } from "../controllers/nfcController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:slug", getPublicNfcExperience);
router.get("/", protect, adminOnly, getAdminNfcExperiences);
router.post("/", protect, adminOnly, createNfcExperience);

export default router;
