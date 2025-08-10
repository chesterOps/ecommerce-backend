import dotenv from "dotenv";

// Configure env
dotenv.config();

import errorHandler from "./utils/errorHandler";
import cookieParser from "cookie-parser";
import AppError from "./utils/appError";
import userRouter from "./routes/user.routes";
import express, { Express, Response, Request, NextFunction } from "express";
import { connectDB } from "./config/db";
import { googleAuth } from "./controllers/auth.controller";

// Create express app
const app: Express = express();

// Define port
const PORT: number = Number(process.env.PORT || 3000);

// Parse cookie
app.use(cookieParser());

// Parse body
app.use(
  express.json({
    limit: "10kb",
  })
);

// Parse googleAuth
app.use('/auth', googleAuth);

// Routes
app.use("/api/v1/users", userRouter);

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
