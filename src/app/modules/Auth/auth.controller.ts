import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AuthServices } from "./auth.service";
import ApiError from "../../../errors/ApiErrors";
import { OtpType } from "./otp.model";
import { clearCookie, getCookieName, setCookie } from "../../../utils/cookieHelper";

/** =======================
 * REGISTER USER
 * ======================= */
const registerUser = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  const result = await AuthServices.registerUser(data);

  setCookie(res, "OTP", result?.token, 1000 * 60 * 10); // 10 minutes

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Check your email for OTP to verify your account",
    data: result,
  });
});

/** =======================
 * VERIFY USER BY OTP
 * ======================= */
const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const { email, type } = req.user;
  const { otp } = req.body;

  const result = await AuthServices.verifyOtp(email, otp, type);

  const { accessToken, refreshToken } = result || {};

  clearCookie(res, "OTP");

  setCookie(res, "ACCESS", accessToken, 1000 * 60 * 60 * 24); // 1 day
  setCookie(res, "REFRESH", refreshToken, 1000 * 60 * 60 * 24 * 7); // 7 days

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User verified successfully",
    data: result,
  });
});

/** =======================
 * LOGIN USER
 * ======================= */
const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await AuthServices.loginUser(email, password);
  const { accessToken, refreshToken } = result?.data || {};

  if (result?.isVerify) {
    if (accessToken) setCookie(res, "ACCESS", accessToken, 1000 * 60 * 60 * 24); // 1 day
    if (refreshToken)
      setCookie(res, "REFRESH", refreshToken, 1000 * 60 * 60 * 24 * 7); // 7 days
  } else {
    if (result?.token) setCookie(res, "OTP", result.token, 1000 * 60 * 10); // 10 minutes
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.data || null,
  });
});

/** =======================
 * REFRESH TOKEN
 * ======================= */
const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies?.[getCookieName("REFRESH")];
  console.log(token)
  if (!token)
    throw new ApiError(httpStatus.UNAUTHORIZED, "Refresh token missing");

  const result = await AuthServices.refreshToken(token);
  const { accessToken, refreshToken } = result || {};

  if (accessToken) setCookie(res, "ACCESS", accessToken, 1000 * 60 * 60 * 24); // 1 day
  if (refreshToken)
    setCookie(res, "REFRESH", refreshToken, 1000 * 60 * 60 * 24 * 7); // 7 days

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Token refreshed successfully",
    data: result,
  });
});

/** =======================
 * GET MY PROFILE
 * ======================= */
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userEmail = req.user?.email;
  const result = await AuthServices.getMyProfile(userEmail);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User profile retrieved successfully",
    data: result,
  });
});

/** =======================
 * RESET PASSWORD
 * ======================= */
const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { password } = req.body;
  const userEmail = req.user?.email;
  const type = req.user?.type;

  if (type !== OtpType.PASSWORD_RESET) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP type");
  }

  const result = await AuthServices.resetPassword(userEmail, password);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset successfully",
    data: result,
  });
});

/** =======================
 * CHANGE PASSWORD
 * ======================= */
const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user?.id;

  const result = await AuthServices.changePassword(
    userId,
    newPassword,
    oldPassword,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password changed successfully",
    data: result,
  });
});

const otpSend = catchAsync(async (req: Request, res: Response) => {
  const { email, type } = req.body;
  const result = await AuthServices.sendOtpService(email, type);

  setCookie(res, "OTP", result?.data.otpToken, 1000 * 60 * 10); // 10 minutes

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "OTP sent successfully",
    data: result,
  });
});

/* =======================
        LOGOUT
======================= */
const logout = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");

  await AuthServices.logout(userId);

  clearCookie(res, "ACCESS");
  clearCookie(res, "REFRESH");
  clearCookie(res, "OTP");

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logout successful",
    data: null,
  });
});

export const AuthController = {
  registerUser,
  verifyOtp,
  loginUser,
  refreshToken,
  getMyProfile,
  resetPassword,
  changePassword,
  otpSend,
  logout,
};
