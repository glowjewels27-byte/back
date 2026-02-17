import crypto from "crypto";
import Razorpay from "razorpay";
import Order from "../models/Order.js";
import { buildOrderItemsAndTotal, reserveStock } from "./orderController.js";

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  return new Razorpay({ key_id, key_secret });
};

export const createPayment = async (req, res) => {
  const { products, shippingAddress } = req.body;

  try {
    const { items, totalAmount } = await buildOrderItemsAndTotal(products);

    const orderDoc = await Order.create({
      user: req.user._id,
      products: items,
      totalAmount,
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      shippingAddress,
      paymentDetails: { provider: "razorpay" }
    });

    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return res.json({
        provider: "mock",
        localOrderId: orderDoc._id,
        amount: totalAmount,
        currency: "INR"
      });
    }

    const gatewayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `glow_${orderDoc._id}`
    });

    orderDoc.paymentDetails.gatewayOrderId = gatewayOrder.id;
    await orderDoc.save();

    return res.json({
      provider: "razorpay",
      keyId: process.env.RAZORPAY_KEY_ID,
      localOrderId: orderDoc._id,
      orderId: gatewayOrder.id,
      amount: gatewayOrder.amount,
      currency: gatewayOrder.currency
    });
  } catch (err) {
    const status = err.message.includes("Invalid") || err.message.includes("No items") ? 400 : 404;
    return res.status(status).json({ message: err.message });
  }
};

export const verifyPayment = async (req, res) => {
  const { localOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature, provider } = req.body;
  const order = await Order.findById(localOrderId);

  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not allowed" });
  if (order.paymentStatus === "paid") return res.json({ success: true, order });

  if (provider === "mock") {
    try {
      await reserveStock(order.products.map((i) => ({ product: i.product, qty: i.qty })));
      order.paymentStatus = "paid";
      order.paymentDetails.gatewayPaymentId = `mock_pay_${Date.now()}`;
      await order.save();
      return res.json({ success: true, order });
    } catch (err) {
      order.paymentStatus = "failed";
      await order.save();
      return res.status(400).json({ message: err.message });
    }
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return res.status(400).json({ message: "Razorpay secret missing" });
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ message: "Missing Razorpay verification fields" });
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature) {
    order.paymentStatus = "failed";
    await order.save();
    return res.status(400).json({ message: "Invalid payment signature" });
  }

  if (order.paymentDetails.gatewayOrderId && order.paymentDetails.gatewayOrderId !== razorpay_order_id) {
    return res.status(400).json({ message: "Order mismatch" });
  }

  try {
    await reserveStock(order.products.map((i) => ({ product: i.product, qty: i.qty })));
    order.paymentStatus = "paid";
    order.paymentDetails.gatewayOrderId = razorpay_order_id;
    order.paymentDetails.gatewayPaymentId = razorpay_payment_id;
    order.paymentDetails.gatewaySignature = razorpay_signature;
    await order.save();
    return res.json({ success: true, order });
  } catch (err) {
    order.paymentStatus = "failed";
    await order.save();
    return res.status(400).json({ message: err.message });
  }
};
