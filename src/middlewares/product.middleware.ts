import Category from "../models/category.model";
import catchAsync from "../utils/catchAsync";
import { Response, Request, NextFunction } from "express";

export const setImages = (req: Request, _res: Response, next: NextFunction) => {
  // Images array
  let images: { url: string; public_id: string }[] = [];

  // Check for image files
  if (Array.isArray(req.files) && req.files.length > 0) {
    req.files.forEach((file: Express.Multer.File) =>
      images.push({ url: file.path, public_id: file.filename })
    );

    // Append images to body
    req.body.images = images;
  }

  // Next middleware
  next();
};

export const setCategory = catchAsync(async (req, _res, next) => {
  if (!req.body.category) {
    // Fetch uncategorized category
    const uncategorized = await Category.findOne({ name: "Uncategorized" });

    // Go to next middleware if not found
    if (!uncategorized) return next();

    // Set category to uncategorized
    req.body.category = uncategorized._id;
  }

  // Next middleware
  next();
});
