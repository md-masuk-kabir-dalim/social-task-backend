import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { LikeService } from "./like.service";
import ApiError from "../../../errors/ApiErrors";

const toggleLike = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  const { postId, commentId, replyId, type } = req.body;

  if (!userId) throw new ApiError(404,"Unauthorized");

  const result = await LikeService.toggleLike({
    user: userId,
    post: postId,
    comment: commentId,
    reply: replyId,
    type,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.liked ? "Liked successfully" : "UnLiked successfully",
    data: result,
  });
});

export const LikeController = {
  toggleLike,
};

