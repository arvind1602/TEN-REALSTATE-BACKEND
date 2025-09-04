import express from "express";
import {
  CreateUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPasswordWithToken,
  verifyEmail,
  refreshAccessToken,
  verifyUser,
  updateUsername,
  changePassword,
  deleteAccount,
} from "../controllers/User.Controller.js";
import verifyToken from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.post("/create", CreateUser);
router.get("/verify-email/:token", verifyEmail);

router.post("/login", loginUser);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPasswordWithToken);
router.get("/verify", verifyToken, verifyUser);
router.post("/logout", verifyToken, logoutUser);
router.post("/refresh-token", refreshAccessToken);

router.put("/update-username", verifyToken, updateUsername);
router.put("/change-password", verifyToken, changePassword);
router.delete("/delete-account", verifyToken, deleteAccount);

export default router;
