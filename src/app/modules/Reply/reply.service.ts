import { IReply } from "./reply.interface";
import { ReplyModel } from "./reply.model";

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
  updateData: Partial<IReply>,
): Promise<IReply | null> => {
  const reply = await ReplyModel.findByIdAndUpdate(replyId, updateData, {
    new: true,
  });
  return reply;
};

const deleteReply = async (replyId: string): Promise<IReply | null> => {
  const reply = await ReplyModel.findByIdAndDelete(replyId);
  return reply;
};

export const ReplyService = {
  createReply,
  getReplyById,
  updateReply,
  deleteReply,
};
