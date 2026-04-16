import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import ApiError from "../../../errors/ApiErrors";
import config from "../../../config";
import { jwtHelpers } from "../../../utils/jwtHelpers";
import { comparePassword, hashPassword } from "../../../utils/passwordHelpers";
import { IUser } from "../User/user.interface";
import generateOtp from "../../../helpers/generateOtp";
import sendOtp from "../../../helpers/sendOtp";
import { UserModel, UserRole } from "../User/user.model";
import { OtpModel, OtpType } from "./otp.model";

/* =========================
   EMAIL CHECK
========================= */
const assertEmailNotTaken = async (email: string) => {
  const user = await UserModel.findOne({ email });
  if (user) throw new ApiError(400, "Email already exists");
};

/* =========================
   REGISTER
========================= */
const registerUser = async (payload: IUser) => {
  await assertEmailNotTaken(payload.email);

  const hashed = await hashPassword(payload.password);
  const { otp, expiry } = generateOtp();

  const user = await UserModel.create({
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    password: hashed,
    role: UserRole.USER,
    isVerified: false,
    tokenVersion: 1,
  });

  await OtpModel.create({
    otpCode: otp,
    expiresAt: expiry,
    identifier: payload.email,
    type: OtpType.EMAIL_VERIFICATION,
    userId: user._id,
  });

  const otpToken = await sendOtp(
    payload.email,
    OtpType.EMAIL_VERIFICATION,
    user.fullName,
    user._id.toString(),
    config.jwt.verification_secret,
    config.jwt.otp_expires_in,
    "Verify your email"
  );

  return {
    message: "Verification code sent to email",
    data: { otpToken: otpToken.otpToken },
  };
};

/* =========================
   VERIFY OTP
========================= */
const verifyOtp = async (email: string, otp: string, type: OtpType) => {
  const user = await UserModel.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  const otpRecord = await OtpModel.findOne({ identifier: email, type });

  if (!otpRecord) throw new ApiError(400, "OTP invalid");
  if (otpRecord.expiresAt < new Date()) throw new ApiError(400, "OTP expired");
  if (otpRecord.attempts >= 5) throw new ApiError(400, "Too many attempts");

  if (otpRecord.otpCode !== otp) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new ApiError(400, "Invalid OTP");
  }

  await OtpModel.deleteOne({ identifier: email, type });

  user.isVerified = true;
  await user.save();

  const accessToken = jwtHelpers.generateToken(
    { id: user._id, email: user.email, role: user.role },
    config.jwt.access_secret,
    config.jwt.access_expires_in
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    },
    config.jwt.refresh_secret,
    config.jwt.refresh_expires_in
  );

  return {
    message: "Email verified successfully",
    data: { accessToken, refreshToken },
  };
};

/* =========================
   LOGIN
========================= */
const loginUser = async (email: string, password: string) => {
  const user = await UserModel.findOne({ email }).select("+password");
  if (!user) throw new ApiError(404, "User not found");

  if (user.lockUntil && user.lockUntil > new Date())
    throw new ApiError(403, "Account locked");

  const isValid = await comparePassword(password, user.password);

  if (!isValid) {
    user.loginAttempts += 1;
    if (user.loginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    await user.save();
    throw new ApiError(401, "Invalid credentials");
  }

  if (!user.isVerified) {
    const { otp, expiry } = generateOtp();

    await OtpModel.findOneAndUpdate(
      { identifier: email },
      {
        otpCode: otp,
        expiresAt: expiry,
        type: OtpType.EMAIL_VERIFICATION,
        userId: user._id,
      },
      { upsert: true }
    );

    const otpToken = await sendOtp(
      email,
      OtpType.EMAIL_VERIFICATION,
      user.fullName,
      user._id.toString(),
      config.jwt.verification_secret,
      config.jwt.otp_expires_in,
      "Verify your email"
    );

    return {
      message: "Email not verified. OTP sent again",
      data: { otpToken: otpToken.otpToken },
    };
  }

  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = jwtHelpers.generateToken(
    { id: user._id, email: user.email, role: user.role },
    config.jwt.access_secret,
    config.jwt.access_expires_in
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    },
    config.jwt.refresh_secret,
    config.jwt.refresh_expires_in
  );

  return {
    message: "Login successful",
    data: { accessToken, refreshToken },
  };
};

/* =========================
   REFRESH TOKEN
========================= */
const refreshToken = async (token: string) => {
  let decoded;

  try {
    decoded = jwtHelpers.verifyToken(token, config.jwt.refresh_secret);
  } catch {
    throw new ApiError(401, "Invalid token");
  }

  const user = await UserModel.findById(decoded.id);
  if (!user) throw new ApiError(404, "User not found");

  if (decoded.tokenVersion !== user.tokenVersion)
    throw new ApiError(401, "Session expired");

  const accessToken = jwtHelpers.generateToken(
    { id: user._id, email: user.email, role: user.role },
    config.jwt.access_secret,
    config.jwt.access_expires_in
  );

  const newRefreshToken = jwtHelpers.generateToken(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    },
    config.jwt.refresh_secret,
    config.jwt.refresh_expires_in
  );

  return {
    message: "Token refreshed",
    data: { accessToken, refreshToken: newRefreshToken },
  };
};

// ------------------------------
// PROFILE
// ------------------------------
const getMyProfile = async (email: string) => {
  const profile = await UserModel.findOne(
    { email },
    {
      _id: 1,
      fullName: 1,
      email: 1,
      phoneNo: 1,
      image: 1,
      role: 1,
      isVerified: 1,
      createdAt: 1,
    }
  );

  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return {
    message: "Profile fetched successfully",
    data: profile,
  };
};

// ------------------------------
// RESET PASSWORD
// ------------------------------
const resetPassword = async (email: string, newPassword: string) => {
  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const hashed = await hashPassword(newPassword);

  await UserModel.updateOne(
    { _id: user._id },
    { password: hashed }
  );

  return { message: "Password reset successful" };
};

// ------------------------------
// CHANGE PASSWORD
// ------------------------------
const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
) => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const isMatch = await comparePassword(oldPassword, user.password);

  if (!isMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Old password is incorrect");
  }

  const hashed = await hashPassword(newPassword);

  await UserModel.updateOne(
    { _id: userId },
    { password: hashed }
  );

  return { message: "Password changed successfully" };
};

// ------------------------------
// SEND OTP SERVICE
// ------------------------------
const sendOtpService = async (email: string, type: OtpType) => {
  const user = await UserModel.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  let secret = "";

  if (type === "EMAIL_VERIFICATION") {
    if (user.isVerified) throw new ApiError(400, "Already verified");

    secret = config.jwt.verification_secret;
  } else if (type === "PASSWORD_RESET") {
    secret = config.jwt.password_reset_secret;
  } else {
    throw new ApiError(400, "Invalid request");
  }

  const otpToken = await sendOtp(
    email,
    type,
    user.fullName,
    user._id.toString(),
    secret,
    config.jwt.otp_expires_in,
    type === "EMAIL_VERIFICATION" ? "Verify your email" : "Reset Password",
  );

  return {message: "OTP sent successfully", data: otpToken };
};

/* ===========================
        LOGOUT USER
=========================== */
const logout = async (userId: string) => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  user.tokenVersion += 1;
  await user.save();

  return { message: "Logged out successfully" };
};

export const AuthServices = {
  registerUser,
  verifyOtp,
  loginUser,
  refreshToken,
  getMyProfile,
  resetPassword,
  changePassword,
  logout,
  sendOtpService,
};
