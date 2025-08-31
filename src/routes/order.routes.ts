import filter from "../middlewares/filter";
import { Router } from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  cancelOrder,
} from "../controllers/order.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { pay, verifyPayment } from "../controllers/payment.controller";

// Order router
const router = Router();

router.route("/").post(createOrder).get(protect, getAllOrders);

router.post("/checkout", pay);

router.post("/verify-payment", verifyPayment);

router.use(protect);

router.patch("/cancel-order/:id", authorize("customer"), cancelOrder);

router
  .route("/:id")
  .patch(authorize("admin"), filter("status"), updateOrder)
  .get(getOrderById)
  .delete(authorize("admin"), deleteOrder);

export default router;
