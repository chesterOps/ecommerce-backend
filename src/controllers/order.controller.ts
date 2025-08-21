import Order from "../models/order.model";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";
import { Request, Response } from "express";

export const createOrder = async (req: Request, res: Response) => {
  try {
    // Get fields
    const { user, billingAddress, items } = req.body;

    // Check if items is empty
    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ status: "fail", message: "No items in the order." });
    }

    // Construct data
    const data: any = {
      billingAddress,
      items,
    };

    // Check for user
    if (user) data.user = user;

    // Create order
    const newOrder = await Order.create({
      ...data,
      status: "pending",
    });

    // Send response
    res.status(201).json({
      status: "success",
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    // Log error
    console.error("Error creating order:", error);

    // Send error response
    res.status(500).json({
      status: "error",
      message: "Failed to create order",
    });
  }
};

export const getAllOrders = async (_req: Request, res: Response) => {
  // Get role
  const role = res.locals.user.role;

  // Construct query
  let query;

  // Check role
  if (role === "admin") {
    query = Order.find();
  } else {
    query = Order.find({ user: res.locals.user._id });
  }

  try {
    // Fetch orders
    const orders = await query.sort({ createdAt: -1 });

    // Send response
    res
      .status(200)
      .json({ status: "success", count: orders.length, data: orders });
  } catch (error) {
    // Log error
    console.error("Error fetching all orders:", error);

    // Send error response
    res.status(500).json({
      status: "error",
      message: "Failed to fetch orders",
    });
  }
};

export const cancelOrder = catchAsync(async (req, res, next) => {
  // Cancel order
  const order = Order.findOneAndUpdate(
    { id: req.params.id, user: res.locals.user._id },
    { status: "cancelled" },
    { new: true }
  );

  // Check if order was found
  if (!order) return next(new AppError("Order not found", 404));

  // Send response
  res.status(200).json({
    status: "success",
    message: "Order cancelled successfully",
    data: order,
  });
});

export const getOrderById = async (req: Request, res: Response) => {
  // Get role
  const role = res.locals.user.role;

  // Construct query based on role
  let query;

  // Check role
  if (role === "admin") {
    query = Order.findById(req.params.id);
  } else {
    query = Order.findOne({ user: res.locals.user._id, id: req.params.id });
  }

  try {
    // Find order
    const order = await query;

    // Send error if order is not found
    if (!order) {
      return res
        .status(404)
        .json({ status: "fail", message: "Order not found" });
    }

    // Send response
    res.status(200).json({ success: true, order });
  } catch (error) {
    // Log error
    console.error("Error fetching order by ID:", error);

    // Send error response
    res.status(500).json({
      status: "error",
      message: "Failed to fetch order",
    });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    // Get fields
    const { status } = req.body;

    if (!["completed", "pending", "cancelled"].includes(status)) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid status value" });
    }

    // Find and update order
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    // Check if order was found
    if (!order) {
      return res
        .status(404)
        .json({ status: "fail", message: "Order not found" });
    }

    // Send response
    res.status(200).json({ status: "fail", data: order });
  } catch (error) {
    // Log error
    console.error("Error updating order status:", error);

    // Send error response
    res.status(500).json({
      status: "error",
      message: "Failed to update order status",
    });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    // Find and delete order
    const order = await Order.findByIdAndDelete(req.params.id);

    // Check if order was found
    if (!order) {
      return res
        .status(404)
        .json({ status: "fail", message: "Order not found" });
    }

    // Send response
    res
      .status(200)
      .json({ status: "success", message: "Order deleted successfully" });
  } catch (error) {
    // Log error
    console.error("Error deleting order:", error);

    // Send error response
    res.status(500).json({
      status: "error",
      message: "Failed to delete order",
    });
  }
};
