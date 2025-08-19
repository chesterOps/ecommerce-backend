import upload from "../middlewares/multer";
import filter from "../middlewares/filter";
import express from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from "../controllers/product.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { setCategory, setImages } from "../middlewares/product.middleware";

// Product router
const productRouter = express.Router();

// Allowed fields
const allowedFields = [
  "title",
  "price",
  "discount",
  "images",
  "published",
  "description",
  "category",
  "sizes",
  "stock",
  "colors",
];

productRouter
  .route("/")
  .get(getProducts)
  .post(
    protect,
    authorize("admin"),
    upload.array("images"),
    filter(...allowedFields),
    setCategory,
    setImages,
    createProduct
  );

productRouter
  .route("/:id")
  .get(getProduct)
  .delete(protect, authorize("admin"), deleteProduct)
  .patch(
    protect,
    authorize("admin"),
    upload.array("images"),
    filter(...allowedFields),
    setImages,
    updateProduct
  );

export default productRouter;
