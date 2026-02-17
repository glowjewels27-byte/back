import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";

dotenv.config();

const categories = [
  { name: "Necklaces", enabled: true },
  { name: "Earrings", enabled: true },
  { name: "Rings", enabled: true },
  { name: "Bracelets", enabled: true },
  { name: "Anklets", enabled: true },
  { name: "Combos", enabled: true }
];

const products = [
  {
    name: "Champagne Glow Pearl Necklace",
    category: "Necklaces",
    type: "Daily",
    price: 1299,
    discount: 10,
    description: "Soft champagne tones with luminous faux pearls for everyday elegance.",
    images: [
      "https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?auto=format&fit=crop&w=900&q=80"
    ],
    stock: 40,
    tags: ["daily", "minimal"]
  },
  {
    name: "Rose Quartz Halo Studs",
    category: "Earrings",
    type: "Daily",
    price: 599,
    discount: 8,
    description: "Minimal blush studs with a soft halo sparkle.",
    images: [
      "https://images.unsplash.com/photo-1512310604669-443f26c35f52?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512310604669-443f26c35f52?auto=format&fit=crop&w=900&q=80"
    ],
    stock: 90,
    tags: ["daily", "minimal"]
  },
  {
    name: "Ivory Glow Layered Necklace",
    category: "Necklaces",
    type: "Party",
    price: 1599,
    discount: 12,
    description: "Layered chains with ivory enamel details for a modern party look.",
    images: [
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=900&q=80"
    ],
    stock: 35,
    tags: ["party", "layered"]
  },
  {
    name: "Champagne Wave Bracelet",
    category: "Bracelets",
    type: "Daily",
    price: 749,
    discount: 0,
    description: "Soft gold wave bracelet that stacks beautifully.",
    images: [
      "https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=900&q=80"
    ],
    stock: 65,
    tags: ["daily", "stack"]
  },
  {
    name: "Noor Pearl Anklet",
    category: "Anklets",
    type: "Festive",
    price: 699,
    discount: 10,
    description: "Festive pearl anklet with subtle sparkle for traditional fits.",
    images: [
      "https://images.unsplash.com/photo-1512310604669-443f26c35f52?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512310604669-443f26c35f52?auto=format&fit=crop&w=900&q=80"
    ],
    stock: 45,
    tags: ["festive", "pearls"]
  },
  {
    name: "Glow Luxe Cocktail Ring",
    category: "Rings",
    type: "Party",
    price: 999,
    discount: 15,
    description: "Statement ring with crystal shine and bold silhouette.",
    images: [
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?auto=format&fit=crop&w=900&q=80"
    ],
    stock: 55,
    tags: ["party", "statement"]
  },
  {
    name: "Everyday Glow Combo",
    category: "Combos",
    type: "Daily",
    price: 2199,
    discount: 10,
    description: "Minimal necklace + studs combo for daily wear.",
    images: [
      "https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512310604669-443f26c35f52?auto=format&fit=crop&w=900&q=80"
    ],
    stock: 28,
    tags: ["combo", "daily"]
  },
  {
    name: "Blush Bloom Drop Earrings",
    category: "Earrings",
    type: "Party",
    price: 999,
    discount: 15,
    description: "Delicate blush crystals with a statement silhouette.",
    images: [
      "https://images.unsplash.com/photo-1512310604669-443f26c35f52?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512310604669-443f26c35f52?auto=format&fit=crop&w=900&q=80"
    ],
    stock: 60,
    tags: ["party", "trending"]
  },
  {
    name: "Ivory Gleam Stacking Rings",
    category: "Rings",
    type: "Daily",
    price: 799,
    discount: 5,
    description: "Set of 3 slim bands with ivory enamel accents.",
    images: [
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=900&q=80"
    ],
    stock: 80,
    tags: ["stack", "minimal"]
  },
  {
    name: "Festive Noor Kundan Choker",
    category: "Necklaces",
    type: "Festive",
    price: 2499,
    discount: 20,
    description: "Kundan-inspired choker with modern polish for festive nights.",
    images: [
      "https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?auto=format&fit=crop&w=900&q=80"
    ],
    stock: 25,
    tags: ["festive", "statement"]
  },
  {
    name: "Glow Charm Bracelet",
    category: "Bracelets",
    type: "Daily",
    price: 699,
    discount: 0,
    description: "Lightweight charm bracelet with a soft gold finish.",
    images: [
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512310604669-443f26c35f52?auto=format&fit=crop&w=900&q=80"
    ],
    stock: 70,
    tags: ["daily", "gift"]
  },
  {
    name: "Midnight Sparkle Anklet",
    category: "Anklets",
    type: "Party",
    price: 599,
    discount: 10,
    description: "Micro-crystal anklet that glows under lights.",
    images: [
      "https://images.unsplash.com/photo-1512310604669-443f26c35f52?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512310604669-443f26c35f52?auto=format&fit=crop&w=900&q=80"
    ],
    stock: 50,
    tags: ["party", "trending"]
  },
  {
    name: "Glow Party Combo Set",
    category: "Combos",
    type: "Party",
    price: 2799,
    discount: 18,
    description: "Earrings + necklace set curated for party-ready looks.",
    images: [
      "https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=900&q=80"
    ],
    stock: 30,
    tags: ["combo", "party"]
  }
];

const seed = async () => {
  await connectDB();
  await User.deleteMany();
  await Product.deleteMany();
  await Category.deleteMany();

  const adminPass = await bcrypt.hash("Admin@123", 10);
  const userPass = await bcrypt.hash("User@123", 10);

  await User.create([
    { name: "Glow Admin", email: "admin@glowjewels.com", password: adminPass, role: "admin" },
    { name: "Aanya Sharma", email: "aanya@example.com", password: userPass, role: "user" }
  ]);

  await Category.insertMany(categories);
  await Product.insertMany(products);

  console.log("Seed complete");
  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  mongoose.disconnect();
});
