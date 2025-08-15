import Product from "../models/product.model";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import {
  createOne,
  deleteOne,
  findAll,
  findOne,
} from "../utils/handlerFactory";
import { deleteImages } from "../utils/helpers";

export const createProduct = createOne(Product);

export const getProduct = findOne(Product, "slug");

export const getProducts = findAll(Product);

export const deleteProduct = deleteOne(Product);

export const updateProduct = catchAsync(async (req, res, next) => {
  // Fetch previous document
  const prevDoc = await Product.findById(req.params.id);

  // Check if product exists
  if (!prevDoc) return next(new AppError("Product does not exist", 404));

  // Update product
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    }
  );

  // Check if product was updated
  if (!updatedProduct) return next(new AppError("Product does not exist", 404));

  // Check for new images
  if (prevDoc.images && req.body.images) {
    // Get public ids
    const public_ids = prevDoc.images.map((image) => image.public_id);

    // Delete previous images from cloudinary
    await deleteImages(public_ids);
  }

  // Send response
  res.status(200).json({
    status: "success",
    message: "Product updated successfully",
    data: updatedProduct.toObject(),
  });
});
