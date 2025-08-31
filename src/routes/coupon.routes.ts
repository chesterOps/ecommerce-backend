import express from "express";
import { authorize, protect } from "../middlewares/auth.middleware";
import {
  applyCoupon,
  createCoupon,
  deleteCoupon,
  getCoupon,
  getCoupons,
  updateCoupon,
} from "../controllers/coupon.controller";

// Coupon router
const couponRouter = express.Router();

couponRouter.post("/apply", applyCoupon);

couponRouter.use(protect);

couponRouter.use(authorize("admin"));

couponRouter.route("/").get(getCoupons).post(createCoupon);

couponRouter
  .route("/:id")
  .get(getCoupon)
  .delete(deleteCoupon)
  .patch(updateCoupon);

export default couponRouter;
