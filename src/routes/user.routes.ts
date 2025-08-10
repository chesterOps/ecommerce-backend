import express from "express";
import filter from "../middlewares/filter";
import {
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import {
  deleteUser,
  getUser,
  updateUser,
} from "../controllers/user.controller";
import { setUserID } from "../middlewares/user.middleware";

import { googleAuth } from "../controllers/auth.controller";

// User router
const userRouter = express.Router();

userRouter.post("/forgot-password", forgotPassword);

userRouter.patch("/reset-password/:token", resetPassword);

userRouter.use(protect);

userRouter.get("/get-profile", setUserID, getUser);

userRouter.use(authorize(["admin"]));

userRouter
  .route("/:id")
  .get(getUser)
  .delete(deleteUser)
  .patch(
    filter(["role", "active", "address", "firstName", "lastName"]),
    updateUser
  );

  userRouter.post('/google', googleAuth);

export default userRouter;
