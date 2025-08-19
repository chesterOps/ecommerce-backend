import Order from "../models/order.model";
import { Request, Response, NextFunction } from 'express';

export const createOrder =  (async (req: Request, res: Response) => {
  try {
    const { user, billingAddress, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in the order." });
    }

    const newOrder = await Order.create({
      user,
      billingAddress,
      items,
      status: "pending",
    });

    res.status(201).json({ success: true, order: newOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});


export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};


export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};


export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    if (!["completed", "pending", "cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};


export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete order",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};