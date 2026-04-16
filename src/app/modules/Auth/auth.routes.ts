import express from "express";
import auth from "../../middlewares/auth";
import { AuthController } from "./auth.controller";
import { rateLimiter } from "../../middlewares/rate_limiter";
import validateRequest from "../../middlewares/validateRequest";
import { AuthValidation } from "./auth.validation";

const router = express.Router();

// ------------------------------
// AUTHENTICATION ROUTES
// ------------------------------

router.post("/register",validateRequest(AuthValidation.registerSchema),rateLimiter(10), AuthController.registerUser);
router.post("/login",validateRequest(AuthValidation.loginSchema), rateLimiter(10), AuthController.loginUser);
router.post("/logout", auth(), rateLimiter(10), AuthController.logout);
router.post("/refresh-token", rateLimiter(10), AuthController.refreshToken);

// ------------------------------
// OTP / VERIFICATION ROUTES
// ------------------------------
router.post("/otp/send",validateRequest(AuthValidation.sendOtpSchema), rateLimiter(10), AuthController.otpSend);
router.patch("/otp/verify",validateRequest(AuthValidation.verifyOtpSchema), auth(), rateLimiter(10), AuthController.verifyOtp);

// ------------------------------
// PASSWORD ROUTES
// ------------------------------
router.patch(
  "/password/reset",
  auth(),
  rateLimiter(10),
  validateRequest(AuthValidation.resetPasswordSchema),
  AuthController.resetPassword,
);
router.patch(
  "/password/change",
  auth(),
  rateLimiter(10),
  validateRequest(AuthValidation.changePasswordSchema),
  AuthController.changePassword,
);

// ------------------------------
// PROFILE ROUTES
// ------------------------------

router.get("/me", auth(), AuthController.getMyProfile);

export const AuthRoutes = router;
