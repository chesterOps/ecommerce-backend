import mongoose, { Query } from "mongoose";
import Product from "./product.model";

// Review schema
const reviewSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Review must have content"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Review must have a rating"],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Review must have a product"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must have an author"],
    },
  },
  {
    statics: {
      async calcAvgRating(prodID: mongoose.Types.ObjectId) {
        // Compute stats
        const stats = await this.aggregate([
          { $match: { product: prodID } },
          {
            $group: {
              _id: "$product",
              avgRating: { $avg: "$rating" },
              length: { $sum: 1 },
            },
          },
        ]);

        // Options
        let options = {};

        // Set rating field
        if (stats.length > 0)
          options = {
            rating: {
              value: stats[0].avgRating,
              length: stats[0].length,
            },
          };
        // Remove field
        else options = { $unset: { rating: undefined } };

        // Update average rating
        await Product.findByIdAndUpdate(prodID, options);
      },
    },
  }
);

// Prevent duplicate reviews
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Populate user field
reviewSchema.pre(/^find/, function (this: Query<any, any>, next) {
  this.populate({
    path: "user",
    select: "name email -_id",
  });
  next();
});

// Update product rating
reviewSchema.post(
  ["save", "findOneAndDelete", "findOneAndUpdate"],
  function (document) {
    if (document) document.constructor.calcAvgRating(document.product);
  }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
