import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { getEmails, sendEmail } from "./controllers";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "UP" });
});

// app.use((req, res, next) => {
//   const allowedOrigins = ["http://localhost:8001", "http://127.0.0.1:8001"];
//   const origin = req.headers.origin || "";
//   if (allowedOrigins.includes(origin)) {
//     res.setHeader("Access-Control-Allow-Origin", origin);
//     next();
//   } else {
//     res.status(403).json({ message: "Forbidden" });
//   }
// });

// routes
app.post("/emails/send", sendEmail as any);
app.get("/emails", getEmails as any);
//Error handler
app.use((err, _req, res, _next) => {
  console.log(err.stack);
  res.status(500).json({ message: "Internal server error" });
});
const port = process.env.PORT || 4005;
const serviceName = process.env.SERVICE_NAME || "Email-Service";

app.listen(port, () => {
  console.log(`${serviceName} is running on port ${port}`);
});


