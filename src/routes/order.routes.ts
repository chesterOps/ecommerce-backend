import { Router } from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} from "../controllers/order.controller";

const router = Router();

router.post("/", createOrder);          // Create order
router.get("/", getAllOrders);          // Get all orders
router.get("/:id", getOrderById);       // Get order by ID
router.put("/:id/status", updateOrder); // Update order status
router.delete("/:id", deleteOrder);     // Delete order

export default router;
