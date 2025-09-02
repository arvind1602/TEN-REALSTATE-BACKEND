import express from "express";
import {
  CreateUser,
  loginUser,
  forgotPassword,
  resetPasswordWithToken,
  verifyEmail,
  refreshAccessToken,
  verifyUser,
  updateUsername,
  changePassword,
  deleteAccount,
  // verifyLogin,
} from "../controllers/User.Controller.js";

const router = express.Router();

router.post("/create", CreateUser);
router.get("/verify-email/:token", verifyEmail);

router.post("/login", loginUser);
// router.get("/verify-login/:token", verifyLogin);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPasswordWithToken);
router.route("/verify").post(verifyToken, verifyUser);
router.route("/logout").post(verifyToken, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

router.put("/update-username/", verifyToken, updateUsername);
router.put("/change-password", verifyToken, changePassword);
router.delete("/delete-account", verifyToken, deleteAccount);
export default router;
