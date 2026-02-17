import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const buildOrderItemsAndTotal = async (products) => {
  if (!products?.length) throw new Error("No items");

  const items = [];
  let totalAmount = 0;

  for (const item of products) {
    const product = await Product.findById(item.product);
    if (!product) throw new Error("Product missing");

    const qty = Number(item.qty || 0);
    if (qty <= 0) throw new Error("Invalid quantity");

    const discountPct = product.discount || 0;
    const finalPrice = Math.round(product.price * (1 - discountPct / 100));

    items.push({
      product: product._id,
      name: product.name,
      price: finalPrice,
      qty,
      image: product.images?.[0]
    });

    totalAmount += finalPrice * qty;
  }

  return { items, totalAmount };
};

export const reserveStock = async (products) => {
  for (const item of products) {
    const product = await Product.findById(item.product);
    if (!product) throw new Error("Product missing");
    if (product.stock < item.qty) throw new Error(`Insufficient stock for ${product.name}`);
    product.stock -= item.qty;
    await product.save();
  }
};

export const createOrder = async (req, res) => {
  const { products, paymentMethod, shippingAddress } = req.body;
  if (paymentMethod !== "cod") {
    return res.status(400).json({ message: "Use /api/payments/create for online payments" });
  }

  try {
    const { items, totalAmount } = await buildOrderItemsAndTotal(products);
    await reserveStock(products);

    const order = await Order.create({
      user: req.user._id,
      products: items,
      totalAmount,
      paymentMethod: "cod",
      paymentStatus: "pending",
      shippingAddress,
      paymentDetails: { provider: "cod" }
    });

    return res.status(201).json(order);
  } catch (err) {
    const status =
      err.message.includes("stock") || err.message.includes("Invalid") || err.message.includes("No items") ? 400 : 404;
    return res.status(status).json({ message: err.message });
  }
};

export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
};

export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not allowed" });
  }
  res.json(order);
};

export const updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });
  order.status = req.body.status || order.status;
  if (req.body.paymentStatus) order.paymentStatus = req.body.paymentStatus;
  await order.save();
  res.json(order);
};

export const getAllOrders = async (req, res) => {
  const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
  res.json(orders);
};
