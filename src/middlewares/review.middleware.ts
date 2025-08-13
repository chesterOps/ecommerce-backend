import Review from "../models/review.model";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";

export const checkUser = catchAsync(async (req, res, next) => {
  // Find review
  const review = await Review.findById(req.params.id);

  // Check if review exists
  if (!review) return next(new AppError("Review does not exist", 404));

  // Check if review belongs to user
  if (review.user._id.toString() !== res.locals.user._id.toString())
    return next(
      new AppError("You do not have permission to perform this action.", 403)
    );

  next();
});
