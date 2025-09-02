import jwt from "jsonwebtoken";
import User from "../models/User.Model.js";
import sendEmail from "../utils/sendEmail.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

/* ============================================================
   Generate Access + Refresh Tokens
============================================================ */
const generateToken = async (user) => {
  const accessToken = jwt.sign(
    { id: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "1d" }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d" }
  );

  user.refresh_token = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
};

/* ============================================================
   Register New User
============================================================ */
const CreateUser = async (req, res) => {
  try {
    const { username, email, fullname, password } = req.body;
    if (!username || !email || !fullname || !password)
      throw new ApiError("All fields are required", 400);

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser)
      throw new ApiError("Username or email already exists", 400);

    const newUser = await User.create({
      username,
      email,
      fullname,
      password,
      verification: false,
    });

    // Create Email Verification Token
    const token = jwt.sign(
      { id: newUser._id },
      process.env.EMAIL_VERIFY_SECRET,
      { expiresIn: process.env.EMAIL_VERIFY_EXPIRES_IN || "10m" }
    );

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${encodeURIComponent(token)}`;

    const html = `
      <p>Hello ${newUser.username || newUser.fullname},</p>
      <p>Please verify your email by clicking below:</p>
      <p><a href="${verifyUrl}">Verify Email</a></p>
      <p>This link will expire in 10 minutes.</p>
    `;

    await sendEmail(newUser.email, "Verify Your Email", html);

    const userObj = newUser.toObject();
    delete userObj.password;
    delete userObj.refresh_token;

    // Auto-delete unverified users after 10 minutes
    setTimeout(
      async () => {
        const freshUser = await User.findById(newUser._id);
        if (freshUser && !freshUser.verification) {
          await User.findByIdAndDelete(newUser._id);
        }
      },
      10 * 60 * 1000
    );

    return res
      .status(201)
      .json(
        new ApiResponse(userObj, "User created. Please verify your email.", 201)
      );
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "An error occurred while creating user",
    });
  }
};

/* ============================================================
   Verify Email
============================================================ */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) throw new ApiError("Token is required", 400);

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.EMAIL_VERIFY_SECRET);
    } catch (e) {
      if (e.name === "TokenExpiredError")
        throw new ApiError("Token expired", 400);
      throw new ApiError("Invalid token", 400);
    }

    const user = await User.findById(decoded.id);
    if (!user) throw new ApiError("User not found", 404);

    user.verification = true;
    await user.save();

    return res
      .status(200)
      .json(new ApiResponse(null, "Email verified successfully", 200));
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      message: err.message || "Email verification failed",
    });
  }
};

/* ============================================================
   Login User
============================================================ */
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      throw new ApiError("All fields are required", 400);

    const user = await User.findOne({ username });
    if (!user) throw new ApiError("User not found", 404);

    if (!user.verification)
      throw new ApiError("Email not verified. Please verify your email.", 403);

    const isPasswordMatch = await user.isPasswordValid(password);
    if (!isPasswordMatch) throw new ApiError("Invalid password", 401);

    const { accessToken, refreshToken } = await generateToken(user);

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refresh_token;

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    return res
      .cookie("refreshToken", refreshToken, cookieOptions)
      .cookie("accessToken", accessToken, cookieOptions)
      .status(200)
      .json(new ApiResponse(userObj, "Login successful", 200));
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "An error occurred while logging in",
    });
  }
};

/* ============================================================
   Forgot Password
============================================================ */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) throw new ApiError("Email is required", 400);

    const user = await User.findOne({ email });
    const genericMsg =
      "If an account with that email exists, a link to reset your password has been sent.";

    if (!user)
      return res.status(200).json(new ApiResponse(null, genericMsg, 200));

    const token = jwt.sign(
      { id: user._id },
      process.env.RESET_PASSWORD_SECRET,
      { expiresIn: process.env.RESET_PASSWORD_EXPIRES_IN || "15m" }
    );

    const resetPasswordUrl = `${process.env.CLIENT_URL}/reset-password/${encodeURIComponent(token)}`;

    const html = `
      <p>Hello ${user.username || user.fullname},</p>
      <p>You requested a password reset. Click below:</p>
      <p><a href="${resetPasswordUrl}">Reset Password</a></p>
    `;

    await sendEmail(user.email, "Reset Password Request", html);

    return res.status(200).json(new ApiResponse(null, genericMsg, 200));
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      message: err.message || "Failed to send reset password email",
    });
  }
};

/* ============================================================
   Reset Password
============================================================ */
const resetPasswordWithToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token) throw new ApiError("Token is required", 400);
    if (!newPassword) throw new ApiError("New password is required", 400);

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
    } catch (e) {
      if (e.name === "TokenExpiredError")
        throw new ApiError("Token expired", 400);
      throw new ApiError("Invalid token", 400);
    }

    const user = await User.findById(decoded.id);
    if (!user) throw new ApiError("User not found", 404);

    user.password = newPassword;
    user.refresh_token = null;
    await user.save();

    return res
      .status(200)
      .json(new ApiResponse(null, "Password has been reset successfully", 200));
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      message: err.message || "Failed to reset password",
    });
  }
};

/* ============================================================
   Logout User
============================================================ */
const logoutUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError("User not found", 400);

    user.refresh_token = null;
    await user.save();

    res
      .clearCookie("refreshToken")
      .clearCookie("accessToken")
      .status(200)
      .json(new ApiResponse(null, "Logout successful", 200));
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || "An error occurred while logging out",
    });
  }
};

/* ============================================================
   Refresh Access Token
============================================================ */
const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken =
      req.cookies.refreshToken || req.headers.authorization?.split(" ")[1];
    if (!refreshToken) throw new ApiError("Refresh token is required", 401);

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) throw new ApiError("User not found", 404);

    if (user.refresh_token !== refreshToken)
      throw new ApiError("Invalid refresh token", 403);

    const { accessToken, refreshToken: newRefreshToken } =
      await generateToken(user);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    res
      .cookie("refreshToken", newRefreshToken, options)
      .cookie("accessToken", accessToken, options)
      .status(200)
      .json(new ApiResponse(null, "Access token refreshed successfully", 200));
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message:
        error.message || "An error occurred while refreshing access token",
    });
  }
};

/* ============================================================
   Verify Logged-in User
============================================================ */
const verifyUser = async (req, res) => {
  try {
    const user = req.user; // Already added by auth middleware
    if (!user || !user._id)
      throw new ApiError("Access token not verified", 401);

    res.status(200).json(new ApiResponse(user, "Success", 200));
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Verification failed",
    });
  }
};

/* ============================================================
   Update Username
============================================================ */
const updateUsername = async (req, res) => {
  try {
    const user = req.user;
    if (!req.body.username) throw new ApiError("Username is required", 400);

    user.username = req.body.username;
    await user.save();

    res
      .status(200)
      .json(new ApiResponse(null, "Username updated successfully", 200));
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Failed to update username",
    });
  }
};

/* ============================================================
   Change Password
============================================================ */
const changePassword = async (req, res) => {
  try {
    const user = req.user;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword)
      throw new ApiError("Old and new passwords are required", 400);

    const isMatch = await user.isPasswordValid(oldPassword);
    if (!isMatch) throw new ApiError("Old password is incorrect", 401);

    user.password = newPassword;
    user.refresh_token = null;
    await user.save();

    res
      .status(200)
      .json(new ApiResponse(null, "✅ Password changed successfully", 200));
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "❌ Failed to change password" });
  }
};

/* ============================================================
   Delete Account
============================================================ */
const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.clearCookie("accessToken").clearCookie("refreshToken");
    res
      .status(200)
      .json(new ApiResponse(null, "Account deleted successfully", 200));
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Failed to delete account",
    });
  }
};

export {
  CreateUser,
  verifyEmail,
  loginUser,
  forgotPassword,
  resetPasswordWithToken,
  logoutUser,
  refreshAccessToken,
  verifyUser,
  updateUsername,
  changePassword,
  deleteAccount,
};
