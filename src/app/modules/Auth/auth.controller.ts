import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AuthServices } from "./auth.service";
import ApiError from "../../../errors/ApiErrors";
import { OtpType } from "./otp.model";
import {
  clearCookie,
  getCookieName,
  setCookie,
} from "../../../utils/cookieHelper";

/* =========================
   REGISTER USER
========================= */
const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.registerUser(req.body);

  setCookie(res, "OTP", result.data.otpToken, 1000 * 60 * 10); // 10 min

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: result.message,
    data: result.data,
  });
});

/* =========================
   VERIFY OTP
========================= */
const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const { email, type } = req.user;
  const { otp } = req.body;

  const result = await AuthServices.verifyOtp(email, otp, type);

  clearCookie(res, "OTP");

  setCookie(res, "ACCESS", result.data.accessToken, 1000 * 60 * 60 * 24);
  setCookie(
    res,
    "REFRESH",
    result.data.refreshToken,
    1000 * 60 * 60 * 24 * 7
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.data,
  });
});

/* =========================
   LOGIN USER
========================= */
const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await AuthServices.loginUser(email, password);

  const { accessToken, refreshToken } = result.data || {};

  if (accessToken) {
    setCookie(res, "ACCESS", accessToken, 1000 * 60 * 60 * 24);
  }

  if (refreshToken) {
    setCookie(res, "REFRESH", refreshToken, 1000 * 60 * 60 * 24 * 7);
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.data,
  });
});

/* =========================
   REFRESH TOKEN
========================= */
const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies?.[getCookieName("REFRESH")];

  if (!token) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Refresh token missing"
    );
  }

  const result = await AuthServices.refreshToken(token);

  setCookie(res, "ACCESS", result.data.accessToken, 1000 * 60 * 60 * 24);

  setCookie(
    res,
    "REFRESH",
    result.data.refreshToken,
    1000 * 60 * 60 * 24 * 7
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.data,
  });
});

/* =========================
   PROFILE
========================= */
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.getMyProfile(req.user?.email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.data,
  });
});

/* =========================
   RESET PASSWORD
========================= */
const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { password } = req.body;
  const email = req.user?.email;
  const type = req.user?.type;

  if (type !== OtpType.PASSWORD_RESET) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Invalid OTP type"
    );
  }

  const result = await AuthServices.resetPassword(email, password);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result,
  });
});

/* =========================
   CHANGE PASSWORD
========================= */
const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;

  const result = await AuthServices.changePassword(
    req.user.id,
    oldPassword,
    newPassword
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result,
  });
});

/* =========================
   SEND OTP
========================= */
const otpSend = catchAsync(async (req: Request, res: Response) => {
  const { email, type } = req.body;

  const result = await AuthServices.sendOtpService(email, type);

  setCookie(res, "OTP", result.data.otpToken, 1000 * 60 * 10);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.data,
  });
});

/* =========================
   LOGOUT
========================= */
const logout = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const result = await AuthServices.logout(userId);

  clearCookie(res, "ACCESS");
  clearCookie(res, "REFRESH");
  clearCookie(res, "OTP");

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message, 
    data: null,
  });
});

/* =========================
   EXPORT
========================= */
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