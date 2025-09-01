import mongoose, { Query } from "mongoose";

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

// Order model
const Order = mongoose.model("Order", orderSchema);

export default Order;
