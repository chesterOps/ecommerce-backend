import dotenv from "dotenv";

// Configure env
dotenv.config();

import errorHandler from "./utils/errorHandler";
import cookieParser from "cookie-parser";
import AppError from "./utils/appError";
import cors from "cors";
import userRouter from "./routes/user.routes";
import authRouter from "./routes/auth.routes";
import categoryRouter from "./routes/category.routes";
import productRouter from "./routes/product.routes";
import reviewRouter from "./routes/review.routes";
import couponRouter from "./routes/coupon.routes";
import orderRouter from "./routes/order.routes";
import express, { Express, Response, Request, NextFunction } from "express";
import { connectDB } from "./config/db";
import { contact } from "./controllers/contact.controller";
import flashsaleRouter from "./routes/flashsale.routes";

// Create express app
const app: Express = express();

// Define port
const PORT: number = Number(process.env.PORT || 3000);

// Allowed origins
const allowedOrigins = process.env.FRONT_URL?.split(" ");

// Allow all origins
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      // Allow allowed origins
      if (allowedOrigins && allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Parse cookie
app.use(cookieParser());

// Parse body
app.use(
  express.json({
    limit: "10kb",
    verify: (req: any, _res, buf) => (req.rawBody = buf.toString("utf8")),
  })
);

// Auth routes
app.use("/api/v1/auth", authRouter);

// User routes
app.use("/api/v1/users", userRouter);

// Category routes
app.use("/api/v1/categories", categoryRouter);

// Product routes
app.use("/api/v1/products", productRouter);

// Review routes
app.use("/api/v1/reviews", reviewRouter);

// Coupon route
app.use("/api/v1/coupons", couponRouter);

// Contact route
app.post("/api/v1/contact", contact);

// Order route
app.use("/api/v1/orders", orderRouter);

// Flashsale route
app.use("/api/v1/flashsale", flashsaleRouter);

// Not found response
app.all("/{*any}", (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(errorHandler);

// Connect to database
connectDB();

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Uncaught exception
process.on("uncaughtException", (err: Error) => {
  console.log("Uncaught exception!, Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

// Unhandled rejection
process.on("unhandledRejection", (err: Error) => {
  console.log("Unhandled rejection!, Shutting down...");
  console.error(err.name, err.message);
  server.close(() => process.exit(1));
});
