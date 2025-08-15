import mongoose from "mongoose";
import { slugify } from "../utils/helpers";

// Product schema
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product must have a title"],
    },
    price: {
      type: Number,
      required: [true, "Product must have a price"],
    },
    rating: {
      type: {
        value: {
          type: Number,
          min: 1,
          max: 5,
        },
        length: {
          type: Number,
        },
      },
    },
    discount: {
      type: Number,
      min: 10,
      max: 90,
    },
    published: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    slug: String,
    images: [{ url: String, public_id: String }],
    stock: {
      type: Number,
      default: 0,
    },
    sizes: {
      type: [{ type: String, enum: ["XS", "S", "M", "L", "XL"] }],
    },
    colors: {
      type: [
        {
          name: { type: String, required: true },
          hex: { type: String, required: true },
        },
      ],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productSchema.index({ title: 1 });

productSchema.index({ category: 1 });

productSchema.index({ slug: 1 });

// Reviews
productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id",
});

// Populate reviews
productSchema.pre("findOne", function (next) {
  this.populate({
    path: "reviews",
    select: "content rating user -product",
  }).populate("category");
  next();
});

// Add slug to product on save
productSchema.pre("save", function (next) {
  if (!this.isModified("title")) next();
  this.slug = slugify(this.title);
  next();
});

// Add slug to product on update
productSchema.pre("findOneAndUpdate", function (next) {
  // Get update object
  const update: any = this.getUpdate();

  // Check for title and update slug
  if (update && update.title) {
    update.slug = slugify(update.name);
    this.setUpdate(update);
  }

  next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;
