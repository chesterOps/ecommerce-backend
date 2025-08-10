import express from "express";
import filter from "../middlewares/filter";
import { authorize, protect } from "../middlewares/auth.middleware";
import {
  deleteUser,
  getUser,
  updateUser,
} from "../controllers/user.controller";

// User router
const userRouter = express.Router();

userRouter.use(protect);

userRouter.use(authorize(["admin"]));

userRouter
  .route("/:id")
  .get(getUser)
  .delete(deleteUser)
  .patch(
    filter(["role", "active", "address", "firstName", "lastName"]),
    updateUser
  );

export default userRouter;
