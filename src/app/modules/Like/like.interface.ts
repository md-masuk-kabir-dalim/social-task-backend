import { Types } from "mongoose";

export interface ILike {
  user: Types.ObjectId;
  post?: Types.ObjectId;
  comment?: Types.ObjectId;
  reply?: Types.ObjectId;
  type?: "like" | "dislike";
  createdAt?: Date;
}
