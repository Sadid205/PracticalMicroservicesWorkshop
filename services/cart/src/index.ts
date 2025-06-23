import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { addToCart, clearCart, getMyCart } from "@/controllers";
import "@/events/onKeyExpires";
import "@/receiver";
dotenv.config();

const app = express();

// security middleware
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: (_req, res) => {
    res
      .status(409)
      .json({ message: "Too many requests, please try again later" });
  },
});
app.use("/api", limiter);

app.use(morgan("dev"));
app.use(express.json());

// TODO: Auth middleware

// routes
app.post("/cart/add-to-cart", addToCart as any);
app.get("/cart/me", getMyCart as any);
app.get("/cart/clear", clearCart as any);

// health check
app.get("/health", (_req, res) => {
  res.json({ message: "Cart service is running" });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: "Not Found" });
});

// error handler
app.use((err, _req, res, _next) => {
  console.log(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

const port = process.env.PORT || 4006;
const serviceName = process.env.SERVICE_NAME || "Cart-Service";

app.listen(port, () => {
  console.log(`${serviceName} is running on port ${port}`);
});
