import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { configureRoutes } from "./utils";

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
configureRoutes(app);

// health check
app.get("/health", (_req, res) => {
  res.json({ message: "API Getway is running" });
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

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`API Getway is running on port ${PORT}`);
});
