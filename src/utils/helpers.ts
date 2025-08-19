import cloudinary from "../config/cloudinary";

// Slugify
export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-");
}

export const deleteImages = async (images: string[]) => {
  try {
    // Delete images from cloudinary
    await cloudinary.api.delete_resources(images);
  } catch (err) {
    console.log("Error deleting images:", err);
  }
};
