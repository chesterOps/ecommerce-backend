import Category from "../models/category.model";
import Order from "../models/order.model";
import Product from "../models/product.model";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import { isValidObjectId } from "mongoose";
import {
  createOne,
  deleteOne,
  findAll,
  findOne,
} from "../utils/handlerFactory";
import { deleteImages } from "../utils/helpers";

export const createProduct = createOne(Product);

export const getProduct = findOne(Product, "slug");

export const getProducts = findAll(Product, "title");

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

export const getProductsByCategory = catchAsync(async (req, res, next) => {
  // Get category slug
  const { slug } = req.params;

  // Find category by slug
  const category = await Category.findOne({ slug });

  // Check if category was found
  if (!category) return next(new AppError("Category not found", 404));

  // Fetch products with that category
  const products = await Product.find({ category: { $in: [category._id] } });

  // Send response
  res.status(200).json({
    status: "success",
    length: products.length,
    data: products,
  });
});

export const getRelatedProducts = catchAsync(async (req, res, next) => {
  // Get id or slug
  const { id } = req.params;

  // Declare product var
  let product;

  // Find product using id or slug
  if (isValidObjectId(id)) {
    product = await Product.findById(id);
  } else {
    product = await Product.findOne({ slug: id });
  }

  // Check if product was found
  if (!product) return next(new AppError("Product does not exist", 404));

  // Fetch related products
  const related = await Product.find({
    // Exclude current id
    _id: { $ne: product._id },
    // Match any shared category
    category: { $in: product.category },
  }).limit(4);

  // Send response
  res.status(200).json({
    status: "success",
    length: related.length,
    data: related,
  });
});

export const getRecommendedProducts = catchAsync(async (req, res, next) => {
  const { wishlist } = req.body;

  let products;

  // Check for wishlist ids
  if (!wishlist || !wishlist.length) {
    products = await Product.aggregate([{ $sample: { size: 4 } }]);
  } else {
    // Find products in wishlist
    const wishlistProducts = await Product.find({ _id: { $in: wishlist } });

    // Extract categories
    const categories = [
      ...new Set(wishlistProducts.flatMap((product) => product.category)),
    ];

    // Recommend similar products
    const recommendations = await Product.find({
      category: { $in: categories },
      _id: { $nin: wishlist },
    }).limit(4);

    // Check if recommendations length is equal to zero
    products =
      recommendations.length > 0
        ? recommendations
        : await Product.aggregate([{ $sample: { size: 4 } }]);
  }
  // Send response
  res.status(200).json({
    status: "success",
    data: products,
    length: products.length,
  });
});

export const getBestSelling = catchAsync(async (_req, res, _next) => {
  const bestSelling = await Order.aggregate([
    { $unwind: "$items" }, // break each product out
    {
      $group: {
        _id: "$items.product", // group by product id
        totalSold: { $sum: "$items.quantity" }, // sum quantity
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    { $sort: { totalSold: -1 } }, // highest first
    { $limit: 4 }, // top 4 best-selling
    {
      $project: {
        product: "$$ROOT.product",
        _id: 0,
        totalSold: 1,
      },
    },
  ]);

  const data = bestSelling.map((item) => {
    const product = item.product;
    product.discount = product.flashsale.discount;
    product.flashsale = undefined;

    return {
      ...item.product,
      totalSold: item.totalSold,
    };
  });

  // Send response
  res.status(200).json({
    status: "success",
    data,
  });
});
