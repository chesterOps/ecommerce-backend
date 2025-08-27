import User from "../models/user.model";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import crypto from "crypto";
import Email from "../utils/email";
import cookieConfig from "../config/cookie";
import { signToken } from "../utils/token";
import { NextFunction, Response, Request } from "express";
import { OAuth2Client, TokenPayload } from "google-auth-library";

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

export const googleAuth = catchAsync(async (req, res, next) => {
  // Get token
  const { token } = req.body;

  // New auth client
  const client = new OAuth2Client({
    client_id: process.env.GOOGLE_CLIENT_ID,
  });

  // Verify token and get ticket
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  // Get payload from ticket
  const payload: TokenPayload | undefined = ticket.getPayload();

  // Verify payload
  if (!payload?.sub || !payload?.email || !payload?.name) {
    return next(new AppError("Invaild google token payload", 401));
  }

  // Get google user data
  const { sub: googleId, email, name } = payload;

  let user;

  // Check for user
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    // Add google id
    existingUser.googleId = googleId;

    // Save user
    await existingUser.save({ validateBeforeSave: false });

    // Append to user variable
    user = existingUser.toObject();
  } else {
    // Create new user
    const newUser = new User({
      googleId,
      name,
      email,
      password: null,
    });

    // Save user
    await newUser.save({ validateBeforeSave: false });

    // Append to user variable
    user = newUser.toObject();
  }

  // Create token
  const jwtToken = signToken({ id: user._id.toString(), role: user.role });

  // Add cookie to response
  res.cookie("token", jwtToken, cookieConfig);

  // Redirect user
  res.redirect(`${process.env.FRONT_URL}`);
});

// Signup
export const signup = catchAsync(async (req, res, next) => {
  // Get fields
  const { password, name, phone, email } = req.body;

  // Check if fields are empty
  if (!password || !name || !email || !phone)
    return next(new AppError("All fields are required", 400));

  // Check if email or phone number exists in the database
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (existingUser)
    return next(new AppError("Email or phone already exists", 400));

  // Create user
  const newUser = await User.create({
    password,
    name,
    email,
    phone,
  });

  // Create data object
  const data = newUser.toObject();

  // Remove unnecessary fields
  const { password: pass, active, token: tk, __v, googleId, ...rest } = data;

  // Create token
  const token = signToken({ id: data._id.toString(), role: data.role });

  // Add cookie to response
  res.cookie("token", token, cookieConfig);

  // Send response
  res.status(201).json({
    status: "success",
    message: "User registration successful",
    token,
    data: rest,
  });
});

// Logout
export const logout = (_req: Request, res: Response, _next: NextFunction) => {
  // Overwrite cookie
  res.cookie("token", "no-value", {
    maxAge: 10000,
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

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

export const updateProfile = catchAsync(async (req, res, next) => {
  // Get fields from request body
  const {
    currentPassword,
    newPassword,
    newPasswordConfirm,
    name,
    phone,
    email,
    address,
  } = req.body;

  // Fetch user
  const user = await User.findById(res.locals.user._id).select("+password");

  // Password was changed
  let passwordChanged = false;

  // Check if user was found
  if (!user) return next(new AppError("User does not exist", 404));

  // Check for email and phone
  if (phone || email) {
    // Construct options
    const orArr = [];
    if (phone) orArr.push({ phone });
    if (email) orArr.push({ email });

    // Check for existing user
    const existingUser = await User.findOne({
      $or: orArr,
    });

    // Return error if email or phone exists
    if (existingUser)
      return next(new AppError("Email or phone number already exists", 400));

    // Update fields
    user.phone = phone;
    user.email = email;
  }

  // Check and update remaining fields
  if (name) user.name = name;
  if (address) user.address = address;

  // Check for password change
  if (currentPassword && newPassword && newPasswordConfirm) {
    // Check if passwords match
    if (newPassword !== newPasswordConfirm)
      return next(new AppError("Passwords do not match", 400));

    // Check if old password is correct
    if (!(await user.verifyPassword(currentPassword, user.password)))
      return next(new AppError("Incorrect old password", 400));

    // Update password
    user.password = newPassword;

    // Set password changed
    passwordChanged = true;
  }

  // Save user
  await user.save();

  // Remove unneccessary fields
  const { password, active, token: tk, __v, ...rest } = user.toObject();

  // Check if password was modified and assign new token
  if (passwordChanged) {
    // Create token
    const token = signToken({ id: user._id.toString(), role: user.role });

    // Add cookie to response
    res.cookie("token", token, cookieConfig);
  }

  // Send response
  res.status(200).json({
    status: "success",
    message: "Profile updated successfully",
    data: rest,
  });
});
