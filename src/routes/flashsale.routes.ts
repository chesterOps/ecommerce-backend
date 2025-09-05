import express from "express";
import {
  createFlashSale,
  getFlashSale,
} from "../controllers/flashsale.controller";
import { authorize, protect } from "../middlewares/auth.middleware";

// Flashsale router
const flashsaleRouter = express.Router();

flashsaleRouter
  .route("/")
  .post(protect, authorize("admin"), createFlashSale)
  .get(getFlashSale);

export default flashsaleRouter;
