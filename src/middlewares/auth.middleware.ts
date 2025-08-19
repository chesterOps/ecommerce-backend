import User from "../models/user.model";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import { fetchToken, verifyToken } from "../utils/token";
import { Request, Response, NextFunction } from "express";
// import * as admin from 'firebase-admin';

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

// // Extending the Request interface to include a user property
// declare global {
//   namespace Express {
//     interface Request {
//       user?: admin.auth.DecodedIdToken; // Add user property to Request
//     }
//   }
// }
  
// /**
//  * Middleware to authenticate Firebase ID tokens.
//  * Attaches the decoded token to `req.user`.
//  */
// export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return res.status(401).json({ message: 'Authorization token not provided or malformed.' });
//   }

//   const idToken = authHeader.split(' ')[1]; // Get the token part

//   try {
//     const decodedToken = await admin.auth().verifyIdToken(idToken);
//     req.user = decodedToken; // Attach the decoded token to the request
//     next(); // Proceed to the next middleware or route handler
//   } catch (error) {
//     console.error('Error verifying Firebase ID token:', error);
//     if (error instanceof Error && error.message.includes('Firebase ID token has expired')) {
//       return res.status(401).json({ message: 'Unauthorized: Token expired.' });
//     }
//     return res.status(401).json({ message: 'Unauthorized: Invalid token.' });
//   }
// };

// /**
//  * Middleware to check if the authenticated user has an admin role.
//  * Requires `authenticateToken` to run before it.
//  */
// export const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
//   // Check if req.user exists (meaning authenticateToken ran successfully)
//   if (!req.user) {
//     return res.status(403).json({ message: 'Forbidden: Authentication required first.' });
//   }

//   // More robust way: check Firebase Custom Claims
//   if (!req.user.admin) { // Assuming 'admin' is a custom claim set for admin users
//     return res.status(403).json({ message: 'Forbidden: Admin access required.' });
//   }

//   next(); // User is authorized as admin, proceed
// };