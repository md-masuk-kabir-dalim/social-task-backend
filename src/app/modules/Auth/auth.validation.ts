// auth.validation.ts
import { z } from "zod";

export const AuthValidation = {
  /* ======================
     REGISTER
  ====================== */
  registerSchema: z.object({
    body: z.object({
      firstName: z
        .string()
        .min(2, "First name must be at least 2 characters"),
      lastName: z
        .string()
        .min(2, "Last name must be at least 2 characters"),
      email: z.string().email("Invalid email address"),
      password: z
        .string()
        .min(6, "Password must be at least 6 characters"),
    }),
  }),

  /* ======================
     LOGIN
  ====================== */
  loginSchema: z.object({
    body: z.object({
      email: z.string().email("Invalid email address"),
      password: z.string().min(1, "Password is required"),
    }),
  }),

  /* ======================
     VERIFY OTP
  ====================== */
  verifyOtpSchema: z.object({
    body: z.object({
      otp: z.string().min(4, "OTP must be at least 4 digits").max(8),
    }),
  }),

  /* ======================
     SEND OTP
  ====================== */
  sendOtpSchema: z.object({
    body: z.object({
      email: z.string().email("Invalid email address"),
      type: z.enum(["EMAIL_VERIFICATION", "PASSWORD_RESET"]),
    }),
  }),

  /* ======================
     RESET PASSWORD
  ====================== */
  resetPasswordSchema: z.object({
    body: z.object({
      password: z
        .string()
        .min(6, "Password must be at least 6 characters"),
    }),
  }),

  /* ======================
     CHANGE PASSWORD
  ====================== */
  changePasswordSchema: z.object({
    body: z.object({
      oldPassword: z.string().min(1, "Old password is required"),
      newPassword: z
        .string()
        .min(6, "New password must be at least 6 characters"),
    }),
  }),
};