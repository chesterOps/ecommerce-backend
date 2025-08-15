import User from "../models/user.model";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import { fetchToken, verifyToken } from "../utils/token";
import { Request, Response, NextFunction } from "express";

// Check if user is logged in
export const isLoggedIn = catchAsync(async (req, res, next) => {
  // Fetch token
  const token = fetchToken(req);

  // Check for token
  if (!token) return next();

  // Verify token
  const decodedToken = await verifyToken(token);

  // Check if user exists
  const user = await User.findById(decodedToken.id);
  if (!user) return next();

  // Check if password was changed
  if (decodedToken.iat && user.changedPasswordAfter(decodedToken.iat))
    return next();

  // Set user on response
  res.locals.user = user;

  // Next middleware
  next();
});

// Protect route
export const protect = catchAsync(async (req, res, next) => {
  // Fetch token
  const token = fetchToken(req);

  // Check if token exists
  if (!token) return next(new AppError("Please log in.", 401));

  // Verify token
  const decodedToken = await verifyToken(token);

  // Fetch user
  const user = await User.findById(decodedToken.id);

  // Check if user exists
  if (!user) return next(new AppError("User does not exist", 401));

  // Check if password was changed recently
  if (decodedToken.iat && user.changedPasswordAfter(decodedToken.iat))
    return next(
      new AppError("Password was changed recently. Please log in again", 401)
    );

  // Grant access to route
  res.locals.user = user;

  // Next middleware
  next();
});

// Authorize user
export const authorize =
  (...roles: Array<string>) =>
  (_req: Request, res: Response, next: NextFunction) => {
    // Check if user is authorized to perform action
    if (!roles.includes(res.locals.user.role))
      return next(
        new AppError("You do not have permission to access this resource.", 403)
      );

    // Next middleware
    next();
  };
