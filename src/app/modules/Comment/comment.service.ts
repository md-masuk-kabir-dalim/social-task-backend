import { IComment } from "./comment.interface";
import { CommentModel } from "./comment.model";

const createComment = async (
  commentData: Partial<IComment>,
): Promise<IComment> => {
  const comment = await CommentModel.create(commentData);
  return comment;
};

const getCommentById = async (commentId: string): Promise<IComment | null> => {
  const comment = await CommentModel.findById(commentId)
    .populate("author", "name email")
    .populate("likesCount")
    .populate({
      path: "replies",
      populate: { path: "author", select: "name email" },
    });
  return comment;
};

const updateComment = async (
  commentId: string,
  updateData: Partial<IComment>,
): Promise<IComment | null> => {
  const comment = await CommentModel.findByIdAndUpdate(commentId, updateData, {
    new: true,
  });
  return comment;
};

const deleteComment = async (commentId: string): Promise<IComment | null> => {
  const comment = await CommentModel.findByIdAndDelete(commentId);
  return comment;
};

const getCommentForPostId = async (postId: string) => {
  const comments = await CommentModel.find({ post: postId })
    .populate("author", "name email")
    .populate("likesCount")
    .populate({
      path: "replies",
      populate: { path: "author", select: "name email" },
    });
  return comments;
};

export const CommentService = {
  createComment,
  getCommentById,
  updateComment,
  deleteComment,
  getCommentForPostId,
};
