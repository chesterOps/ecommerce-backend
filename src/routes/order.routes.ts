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
import { authorize, isLoggedIn, protect } from "../middlewares/auth.middleware";
import { pay, verifyPayment } from "../controllers/payment.controller";

// Order router
const router = Router();

router.route("/").post(createOrder).get(protect, getAllOrders);

router.post("/checkout", isLoggedIn, pay);

router.post("/verify-payment", verifyPayment);

router
  .route("/:id")
  .patch(protect, authorize("admin"), filter("status"), updateOrder)
  .get(getOrderById)
  .delete(protect, authorize("admin"), deleteOrder);

router.use(protect);

router.patch("/cancel-order/:id", authorize("customer"), cancelOrder);

export default router;
