import Review from "../models/review.model";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import {
  deleteOne,
  findAll,
  findOne,
  updateOne,
} from "../utils/handlerFactory";

export const deleteReview = deleteOne(Review);

export const getReview = findOne(Review);

export const getReviews = catchAsync(async (_req, res) => {
  // Get role
  const role = res.locals.user.role;

  // Construct query
  let query;

  // Check role
  if (role === "admin") {
    query = Review.find();
  } else {
    query = Review.find({ user: res.locals.user._id });
  }

  const reviews = await query.sort({ createdAt: -1 });

  // Send response
  res
    .status(200)
    .json({ status: "success", count: reviews.length, data: reviews });
});

export const updateReview = updateOne(Review);

export const createReview = catchAsync(async (req, res, next) => {
  // Set user
  req.body.user = res.locals.user._id.toString();

  // Set product
  if (!req.body.product && req.params.id) req.body.product = req.params.id;

  // Check if user already has a review on this product
  const existingReview = await Review.findOne({
    user: req.body.user,
    product: req.body.product,
  });

  // Return error response
  if (existingReview)
    return next(new AppError("You have already reviewed this product", 400));

  // Create review
  const review = await Review.create(req.body);

  // Remove unneccessary fields
  const { __v, ...data } = review.toObject();

  // Send response
  res.status(201).json({
    status: "success",
    message: "Review created successfully",
    data,
  });
});
