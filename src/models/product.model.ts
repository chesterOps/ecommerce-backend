import mongoose from "mongoose";
import Review from "./review.model";
import { deleteImages, slugify } from "../utils/helpers";

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
    flashsale: {
      type: {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Flashsale",
        },
        discount: { type: Number, min: 10, max: 90 },
      },
      required: false,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    slug: String,
    images: {
      type: [
        {
          url: { type: String, required: true },
          public_id: { type: String, required: true },
        },
      ],
      default: undefined,
    },
    stock: {
      type: Number,
      default: 0,
    },
    sizes: {
      type: [String],
      enum: ["XS", "S", "M", "L", "XL"],
      default: undefined,
    },
    colors: {
      type: [
        {
          name: { type: String, required: true },
          hex: { type: String, required: true },
        },
      ],
      default: undefined,
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
  }).populate({
    path: "category",
    select: "name _id",
  });
  next();
});

// Update discount with flash sale discount
productSchema.post("findOne", function (doc) {
  if (!doc || !doc.flashsale) return;
  doc.discount = doc.flashsale.discount;
  doc.flashsale = undefined;
});

// Update discount with flash sale discount for find
productSchema.post("find", function (docs) {
  docs.forEach((doc: any) => {
    if (doc && doc.flashsale) {
      doc.discount = doc.flashsale.discount;
      doc.flashsale = undefined;
    }
  });
});

// Add slug to product on save
productSchema.pre("save", function (next) {
  if (!this.isModified("title")) return next();
  this.slug = slugify(this.title);
  next();
});

// Add slug to product on update
productSchema.pre("findOneAndUpdate", async function (next) {
  // Get update object
  const update: any = this.getUpdate();

  // Check for title and update slug
  if (update && update.title) {
    update.slug = slugify(update.title);
    this.setUpdate(update);
  }

  next();
});

// Delete images and reviews
productSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    // Delete reviews
    await Review.deleteMany({ product: doc._id });

    if (doc.images) {
      // Get public ids
      const public_ids = doc.images.map(
        (image: { url: string; public_id: string }) => image.public_id
      );

      // Delete images from cloudinary
      await deleteImages(public_ids);
    }
  }
});

const Product = mongoose.model("Product", productSchema);

export default Product;
