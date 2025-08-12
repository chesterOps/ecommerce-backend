import express from "express";
import { authorize, protect } from "../middlewares/auth.middleware";
import {
  createCategory,
  deleteCategory,
  getAllCatgeories,
  getCategory,
  updateCategory,
} from "../controllers/category.controller";

// Category router
const categoryRouter = express.Router();

categoryRouter.use(protect);

categoryRouter.use(authorize(["admin"]));

categoryRouter.route("/").get(getAllCatgeories).post(createCategory);

categoryRouter
  .route("/:id")
  .get(getCategory)
  .patch(updateCategory)
  .delete(deleteCategory);
