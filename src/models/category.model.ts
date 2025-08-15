import mongoose from "mongoose";
import Product from "./product.model";

// Category schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Update category for products
categorySchema.post("findOneAndDelete", async function (doc) {
  // Get uncategorized category
  const uncategorized = await this.model.findOne({ name: "Uncategorized" });

  // Update products
  if (doc)
    await Product.updateMany(
      { category: doc._id },
      { category: uncategorized ? uncategorized._id : undefined }
    );
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
