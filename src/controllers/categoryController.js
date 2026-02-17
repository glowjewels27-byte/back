import Category from "../models/Category.js";

export const getCategories = async (req, res) => {
  const categories = await Category.find({ enabled: true }).sort({ name: 1 });
  res.json(categories);
};

export const getAllCategories = async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);
};

export const createCategory = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Name required" });
  const exists = await Category.findOne({ name });
  if (exists) return res.status(400).json({ message: "Category exists" });
  const category = await Category.create({ name });
  res.status(201).json(category);
};

export const updateCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ message: "Category not found" });
  if (req.body.name) category.name = req.body.name;
  if (typeof req.body.enabled === "boolean") category.enabled = req.body.enabled;
  await category.save();
  res.json(category);
};
