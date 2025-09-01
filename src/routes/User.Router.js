import express from "express";
import {
  CreateUser,
  loginUser,
  forgotPassword,
  resetPasswordWithToken,
  verifyEmail,
  // verifyLogin,
} from "../controllers/User.Controller.js";

const router = express.Router();

router.post("/create", CreateUser);
router.get("/verify-email/:token", verifyEmail);

router.post("/login", loginUser);
// router.get("/verify-login/:token", verifyLogin);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPasswordWithToken);

export default router;
