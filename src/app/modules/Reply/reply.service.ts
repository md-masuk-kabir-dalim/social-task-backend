import ApiError from "../../../errors/ApiErrors";
import { IReply } from "./reply.interface";
import { ReplyModel } from "./reply.model";
import httpStatus from "http-status";

const createReply = async (replyData: IReply): Promise<IReply> => {
  const reply = await ReplyModel.create(replyData);
  return reply;
};

const getReplyById = async (replyId: string): Promise<IReply | null> => {
  const reply = await ReplyModel.findById(replyId).populate(
    "author",
    "name email",
  );
  return reply;
};

const updateReply = async (
  replyId: string,
  userId: string,
  updateData: Partial<IReply>
) => {
  const reply = await ReplyModel.findById(replyId);

  if (!reply) {
    throw new ApiError(httpStatus.NOT_FOUND, "Reply not found");
  }

  if (reply.author.toString() !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, "Not allowed");
  }

  const updated = await ReplyModel.findByIdAndUpdate(replyId, updateData, {
    new: true,
  });

  return {
    message: "Reply updated successfully",
    data: updated,
  };
};

const deleteReply = async (replyId: string, userId: string) => {
  const reply = await ReplyModel.findById(replyId);

  if (!reply) {
    throw new ApiError(httpStatus.NOT_FOUND, "Reply not found");
  }

  if (reply.author.toString() !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, "Not allowed");
  }

  await ReplyModel.findByIdAndDelete(replyId);

  return {
    message: "Reply deleted successfully",
    data: null,
  };
};

export const ReplyService = {
  createReply,
  getReplyById,
  updateReply,
  deleteReply,
};
