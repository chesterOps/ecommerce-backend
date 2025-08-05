import dotenv from "dotenv";

// Configure env
dotenv.config();

import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes";
import express, { Express, Response, Request, NextFunction } from "express";
import { connectDB } from "./config/db";

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

// Routes
app.use("/api/v1/users", userRouter);

// Send response
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    message: "Hello there",
  });
});

// Not found response
app.all("/{*any}", (req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

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
