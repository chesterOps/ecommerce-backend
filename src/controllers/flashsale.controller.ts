import Flashsale from "../models/flashsale.model";
import Product from "../models/product.model";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";

export const createFlashSale = catchAsync(async (req, res, next) => {
  // Get fields
  const { start, end, products } = req.body;

  // Check for fields
  if (!start || !end || !products?.length)
    return next(new AppError("Invalid data format", 400));

  // Get product IDs
  const productIds = products.map((item: { id: string }) => item.id);

  // Ensure products exist
  for (const item of products) {
    const productExists = await Product.findById(item.id);
    if (!productExists)
      return next(new AppError(`Product with ${item.id} does not exist`, 400));
  }

  // Delete existing flash sales
  await Flashsale.deleteMany({});

  // Create flash sale
  const flashsale = await Flashsale.create({
    start,
    end,
    products: productIds,
  });

  // Update products with flash sale info
  for (const item of products) {
    await Product.findByIdAndUpdate(item.id, {
      flashsale: { id: flashsale._id, discount: item.discount },
    });
  }

  // Send response
  res.status(201).json({
    status: "success",
    message: "Flash sale created successfully",
    data: flashsale,
  });
});

export const getFlashSale = catchAsync(async (_req, res, next) => {
  // Get flash sale
  const now = new Date();

  // Find active flash sale
  const flashSale = await Flashsale.findOne({
    start: { $lte: now },
    end: { $gte: now },
  }).populate("products");

  // Check if flash sale exists
  if (!flashSale)
    return next(new AppError("No active flash sale at the moment", 404));

  // Send response
  res.status(200).json({
    status: "success",
    data: flashSale,
  });
});
