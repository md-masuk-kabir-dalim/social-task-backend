import { Schema, model } from "mongoose";
import { IUser } from "./user.interface";

// Enums
export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  DELETED = "DELETED",
}

// Schema
const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    fullName: {
      type: String,
      default: function (): string {
        return `${this.firstName} ${this.lastName}`;
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    phoneNo: { type: String },
    image: { type: String, default:"https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },

    isVerified: { type: Boolean, default: false },

    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    lastLoginAt: { type: Date },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
    tokenVersion: { type: Number, default: 1 },
  },
  { timestamps: true },
);

export const UserModel = model<IUser>("User", UserSchema);
