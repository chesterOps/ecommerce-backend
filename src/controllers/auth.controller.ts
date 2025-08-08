import User from "../models/user.model";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import crypto from "crypto";
import Email from "../utils/email";
import cookieConfig from "../config/cookie";
import { signToken } from "../utils/token";
import { NextFunction, Response, Request } from "express";

import { OAuth2Client, TokenPayload } from "google-auth-library";
import jwt from "jsonwebtoken";

export const login = catchAsync(async (req, res, next) => {
  // Get fields
  const { identifier, password } = req.body;

  // Check if login credentials are empty
  if (!identifier || !password)
    return next(new AppError("Please provide login credentials", 400));

  // Fetch user
  const user = await User.findOne({
    $or: [{ email: identifier }, { phone: identifier }],
  }).select("+password");

  // Verify user
  if (!user || !(await user.verifyPassword(password, user.password)))
    return next(new AppError("Incorrect login details", 400));

  // Create data object
  const data = user.toObject();

  // Remove unnecessary fields
  const { password: pass, active, __v, token: tk, ...rest } = data;

  // Create token
  const token = signToken({ id: data._id.toString(), role: data.role });

  // Add cookie to response
  res.cookie("token", token, cookieConfig);

  // Send response
  res.status(200).json({
    status: "success",
    message: "Login successful",
    token,
    data: rest,
  });
});

// Google Autentication

// Define an interface for the incoming request body
interface GoogleAuthRequestBody {
  token: string;
}

// Extend Request type to include our custom body interface
interface CustomRequest extends Request {
  body: GoogleAuthRequestBody;
}

// Initialize OAuth2Client. Use non-null assertion (!) as we assume env variables are set.
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID!);

export const googleAuth = async (req: CustomRequest, res: Response): Promise<void> => {
  const { token } = req.body; 

  try {
    // Verify the Google ID token received from the client
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, 
    });

    // Extract the payload (user information) from the verified ticket
    const payload: TokenPayload | undefined = ticket.getPayload();

    // Check if the payload is valid and contains necessary information
    if (!payload || !payload.sub || !payload.email || !payload.name) {

      // If payload is missing or incomplete, respond with an unauthorized status
      res.status(401).json({ message: "Google authentication failed: Invalid token payload." });
      return; 
    }

    // Destructure specific user details from the payload
    const { sub, email, name, picture } = payload;

    // Attempt to find an existing user in the database by email
    // Assume User.findOne returns a Promise<IUser | null>
    let user = await User.findOne({ email });

    if (!user) {
      // If no user is found, create a new user entry in the database
      // Assume User.create returns a Promise<IUser>
      user = await User.create({
        googleId: sub, 
        name,
        email,
        password: sub, 
        avatar: picture,
      });
    }

    // Generate a JSON Web Token (JWT) for the application's session
    const accessToken: string = jwt.sign(
      { userId: user._id, email: user.email }, 
      process.env.JWT_SECRET!, 
      { expiresIn: "1d" } 
    );

    // Send a successful response with the generated access token
    res.status(200).json({ token: accessToken, message: "Google login successful" });

  } catch (error: any) { 
    
    console.error("Google Auth Error:", error.message);
    // Send an unauthorized response to the client
    res.status(401).json({ message: "Google authentication failed" });
  }
};



// Logout
export const logout = (_req: Request, res: Response, _next: NextFunction) => {
  // Clear cookie
  res.clearCookie("token");

  // Send response
  res.status(200).json({
    status: "success",
    message: "Logout successful",
  });
};

export const forgotPassword = catchAsync(async (req, res, next) => {
  // Fetch user
  const user = await User.findOne({ email: req.body.email });

  // Check if user exists
  if (!user) return next(new AppError("Email does not exist", 404));

  try {
    // Generate token
    const resetToken = user.createToken();

    // Update user
    await user.save({ validateBeforeSave: false });

    // Send email
    await new Email({
      url: `${process.env.FRONT_URL}/reset-password/${resetToken}`,
      to: user.email,
    }).sendPasswordReset();
  } catch (err: any) {
    // Update fields
    user.token = undefined;

    // Save user
    await user.save({ validateBeforeSave: false });

    // Return error
    return next(new AppError(err.message, 500));
  }

  // Send response
  res.status(200).json({
    status: "success",
    message: "Please check your email",
  });
});

// Reset password
export const resetPassword = catchAsync(async (req, res, next) => {
  // Get hashed token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // Fetch user using token
  const user = await User.findOne({
    "token.value": hashedToken,
    "token.expires": { $gt: Date.now() },
  });

  // Send error if token is invalid
  if (!user) return next(new AppError("Token is invalid", 400));

  // Get fields
  const { password, passwordConfirm } = req.body;

  // Check if fields are empty
  if (!password || !passwordConfirm)
    return next(new AppError("All fields are required", 400));

  // Confirm password
  if (password !== passwordConfirm)
    return next(new AppError("Passwords do not match", 400));

  // Update fields
  user.password = req.body.password;
  user.token = undefined;

  // Save user
  await user.save();

  // Send response
  res.status(200).json({
    status: "success",
    message: "Password reset successful",
  });
});
