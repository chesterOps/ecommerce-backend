import express from "express";
import { authorize, protect } from "../middlewares/auth.middleware";
import {
  createCategory,
  deleteCategory,
  getCatgeories,
  getCategory,
  updateCategory,
} from "../controllers/category.controller";

// Category router
const categoryRouter = express.Router();

categoryRouter
  .route("/")
  .get(getCatgeories)
  .post(protect, authorize("admin"), createCategory);

categoryRouter
  .route("/:id")
  .get(getCategory)
  .patch(protect, authorize("admin"), updateCategory)
  .delete(protect, authorize("admin"), deleteCategory);

export default categoryRouter;
