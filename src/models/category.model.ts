import mongoose from "mongoose";
import Product from "./product.model";
import { slugify } from "../utils/helpers";

// Category schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: String,
  },
  { timestamps: true }
);

// Add slug to category on save
categorySchema.pre("save", function (next) {
  if (!this.isModified("name")) return next();
  this.slug = slugify(this.name);
  next();
});

// Add slug to category on update
categorySchema.pre("findOneAndUpdate", async function (next) {
  // Get update object
  const update: any = this.getUpdate();

  // Check for name and update slug
  if (update && update.name) {
    update.slug = slugify(update.name);
    this.setUpdate(update);
  }

  next();
});

// Update category for products
categorySchema.post("findOneAndDelete", async function (doc) {
  // Update products
  if (doc)
    await Product.updateMany(
      { category: doc._id },
      { $pull: { category: doc._id } }
    );
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
