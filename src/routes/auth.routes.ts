import express from "express";
import {
  forgotPassword,
  googleAuth,
  login,
  logout,
  resetPassword,
  signup,
  updateProfile,
} from "../controllers/auth.controller";
import { protect } from "../middlewares/auth.middleware";
import { setUserID } from "../middlewares/user.middleware";
import { getUser } from "../controllers/user.controller";

// Auth router
const authRouter = express.Router();

authRouter.post("/forgot-password", forgotPassword);

authRouter.patch("/reset-password/:token", resetPassword);

authRouter.post("/login", login);

authRouter.post("/logout", logout);

authRouter.post("/signup", signup);

authRouter.post("/google-auth", googleAuth);

authRouter.patch("/update-profile", protect, updateProfile);

authRouter.get("/get-profile", protect, setUserID, getUser);

export default authRouter;
