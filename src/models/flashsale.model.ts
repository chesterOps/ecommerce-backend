import mongoose from "mongoose";

// Flash sale schema
const flashSaleSchema = new mongoose.Schema(
  {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

const Flashsale = mongoose.model("Flashsale", flashSaleSchema);

export default Flashsale;
