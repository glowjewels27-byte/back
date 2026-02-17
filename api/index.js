import dotenv from "dotenv";
import app from "../src/app.js";
import { connectDB } from "../src/config/db.js";

dotenv.config();

export default async function handler(req, res) {
  try {
    await connectDB();
    return app(req, res);
  } catch (err) {
    console.error("DB connection failed", err);
    return res.status(500).json({ message: "Database connection failed" });
  }
}
