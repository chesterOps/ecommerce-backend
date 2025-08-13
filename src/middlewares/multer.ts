import multer from "multer";
import cloudinary from "../config/cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req: Express.Request, file: Express.Multer.File) => {
    // Split file name by "." to remove extension
    const fileName = file.originalname.split(".");

    // Remove the last part (extension)
    fileName.pop();

    return {
      folder: "Exclusive",
      allowed_formats: ["jpg", "png", "jpeg"],
      public_id: `${Date.now()}-${fileName.join("")}`,
      format: file.originalname.split(".").pop(),
    };
  },
});

// Multer middleware using Cloudinary storage
const upload = multer({ storage });

export default upload;
