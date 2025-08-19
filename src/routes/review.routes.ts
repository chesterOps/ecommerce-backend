import filter from "../middlewares/filter";
import express from "express";
import { authorize, protect } from "../middlewares/auth.middleware";
import {
  createReview,
  deleteReview,
  getReview,
  getReviews,
  updateReview,
} from "../controllers/review.controller";
import { checkUser } from "../middlewares/review.middleware";

// Allowed fields
const allowedFields = ["product", "rating", "content"];

// Review router
const reviewRouter = express.Router();

reviewRouter
  .route("/")
  .get(getReviews)
  .post(protect, authorize("customer"), filter(...allowedFields), createReview);

reviewRouter
  .route("/:id")
  .get(getReview)
  .patch(
    protect,
    authorize("customer"),
    filter("rating", "content"),
    checkUser,
    updateReview
  )
  .delete(protect, authorize("customer"), checkUser, deleteReview);

export default reviewRouter;
