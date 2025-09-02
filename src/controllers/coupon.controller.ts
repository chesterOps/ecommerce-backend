import Coupon from "../models/coupon.model";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import {
  createOne,
  deleteOne,
  findAll,
  findOne,
  updateOne,
} from "../utils/handlerFactory";

export const createCoupon = createOne(Coupon);

export const getCoupons = findAll(Coupon);

export const getCoupon = findOne(Coupon);

export const deleteCoupon = deleteOne(Coupon);

export const updateCoupon = updateOne(Coupon);

export const applyCoupon = catchAsync(async (req, res, next) => {
  const { code, cartTotal } = req.body;

  // Find coupon
  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    active: true,
  });

  // Check if coupon was found
  if (!coupon) return next(new AppError("Invalid coupon", 404));

  const now = new Date();

  // Check if coupon is active
  if (coupon.start > now)
    return next(new AppError("Coupon is not active yet", 400));

  // Check if coupon has expired
  if (coupon.end < now) return next(new AppError("Coupon has expired", 400));

  // Calculate discount price
  const finalTotal = (cartTotal - (coupon.discount / 100) * cartTotal).toFixed(
    2
  );

  // Send response
  res.status(200).json({
    status: "success",
    message: "Coupon applied",
    data: { finalTotal, coupon },
  });
});
