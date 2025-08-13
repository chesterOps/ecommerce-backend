import upload from "../middlewares/multer";
import express from "express";
import {
  createProduct,
  getProduct,
  getProducts,
} from "../controllers/product.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { setImages } from "../middlewares/product.middleware";

// Product router
const productRouter = express.Router();

productRouter
  .route("/")
  .get(getProducts)
  .post(
    protect,
    authorize("admin"),
    upload.array("images"),
    setImages,
    createProduct
  );

productRouter.route("/:id").get(getProduct);

export default productRouter;
