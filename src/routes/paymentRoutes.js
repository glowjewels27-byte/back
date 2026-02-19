import express from "express";
import { cancelPayment, createPayment, verifyPayment } from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, createPayment);
router.post("/verify", protect, verifyPayment);
router.delete("/cancel/:localOrderId", protect, cancelPayment);

export default router;
