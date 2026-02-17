import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

const explicitOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  ...(process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
];
const allowVercelPreviews = String(process.env.ALLOW_VERCEL_PREVIEWS || "").toLowerCase() === "true";

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (explicitOrigins.includes(origin)) return cb(null, true);
      if (allowVercelPreviews) {
        try {
          if (/\.vercel\.app$/.test(new URL(origin).hostname)) return cb(null, true);
        } catch (err) {
          return cb(new Error("Invalid origin"));
        }
      }
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);

app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

app.get("/", (req, res) => {
  res.json({ status: "ok", name: "Glow Jewels API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/payments", paymentRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
