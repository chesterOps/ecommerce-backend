import { Response, Request, NextFunction } from "express";

export const setImages = (req: Request, _res: Response, next: NextFunction) => {
  // Images array
  let images: { url: string; public_id: string }[] = [];

  // Check for image files
  if (req.files && Array.isArray(req.files)) {
    req.files.forEach((file: Express.Multer.File) =>
      images.push({ url: file.path, public_id: file.filename })
    );

    // Append images to body
    req.body.images = images;
  }

  // Next middleware
  next();
};
