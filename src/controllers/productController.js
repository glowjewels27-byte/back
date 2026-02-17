import Product from "../models/Product.js";

export const getProducts = async (req, res) => {
  const { category, type, minPrice, maxPrice, sort, q } = req.query;
  const filter = { isActive: true };
  if (category) filter.category = category;
  if (type) filter.type = type;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (q) filter.name = { $regex: q, $options: "i" };

  let query = Product.find(filter);
  if (sort === "price_asc") query = query.sort({ price: 1 });
  if (sort === "price_desc") query = query.sort({ price: -1 });
  if (sort === "newest") query = query.sort({ createdAt: -1 });

  const products = await query.exec();
  res.json(products);
};

export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

export const createProduct = async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
};

export const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  Object.assign(product, req.body);
  await product.save();
  res.json(product);
};

export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  await product.deleteOne();
  res.json({ message: "Product removed" });
};
