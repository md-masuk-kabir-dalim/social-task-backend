import { Types } from "mongoose";

export interface IReply {
  comment: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}
