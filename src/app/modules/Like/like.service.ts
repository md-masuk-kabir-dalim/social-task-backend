import { Types } from "mongoose";
import { ILike } from "./like.interface";
import { LikeModel } from "./like.model";
import ApiError from "../../../errors/ApiErrors";

const toggleLike = async (data: ILike) => {
  const { user, post, comment, reply, type = "like" } = data;

  const targets = [post, comment, reply].filter(Boolean);
  if (targets.length !== 1) {
    throw new ApiError(404,"Provide only one target (post/comment/reply)");
  }

  const query: any = { user };

  if (post) query.post = new Types.ObjectId(post);
  if (comment) query.comment = new Types.ObjectId(comment);
  if (reply) query.reply = new Types.ObjectId(reply);

  // Check existing like
  const existing = await LikeModel.findOne(query);

  // If exists → UNLIKE
  if (existing) {
    await LikeModel.deleteOne({ _id: existing._id });
    return { liked: false };
  }

  // If not → LIKE
  const newLike = await LikeModel.create({
    user,
    post,
    comment,
    reply,
    type,
  });

  return { liked: true, data: newLike };
};

export const LikeService = {
  toggleLike,
};