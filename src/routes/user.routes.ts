import express from "express";
import filter from "../middlewares/filter";
import { authorize, protect } from "../middlewares/auth.middleware";
import {
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from "../controllers/user.controller";

// User router
const userRouter = express.Router();

userRouter.use(protect);

userRouter.use(authorize(["admin"]));

userRouter.route("/").get(getAllUsers);

userRouter
  .route("/:id")
  .get(getUser)
  .delete(deleteUser)
  .patch(filter(["role", "active", "address", "name"]), updateUser);

export default userRouter;
