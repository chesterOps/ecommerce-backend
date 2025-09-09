import mongoose, { Query } from "mongoose";
import Product from "./product.model";

// Order schema
const orderSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      default: "pending",
      enum: ["completed", "pending", "paid", "cancelled"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    ref: { type: String },
    billingAddress: {
      name: { type: String, required: true },
      addressLine1: {
        type: String,
        required: [true, "Address is required"],
      },
      addressLine2: { type: String },
      companyName: { type: String },
      city: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ["card", "cash-on-delivery"],
    },
    items: [
      {
        title: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        product: { type: mongoose.Schema.ObjectId, required: true },
      },
    ],
  },
  { timestamps: true }
);

// Populate user
orderSchema.pre(/^find/, function (this: Query<any, any>, next) {
  this.populate({ path: "user", select: "name email -_id" });
  next();
});

// Update product stock after order is created
orderSchema.post("save", async function (doc) {
  // Update stock for each product
  for (const item of doc.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }
});

// Order model
const Order = mongoose.model("Order", orderSchema);

export default Order;
