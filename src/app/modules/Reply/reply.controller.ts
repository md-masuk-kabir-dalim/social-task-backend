import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ReplyService } from "./reply.service";
import ApiError from "../../../errors/ApiErrors";

// Create a new reply
const createReply = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id; 
  const {  commentId, content } = req.body;

  if (!userId) throw new ApiError(401,"Unauthorized");

  const reply = await ReplyService.createReply({
      author: userId,
      comment: commentId,
      content,
    
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Reply created successfully",
    data: reply,
  });
});

// Get a reply by ID
const getReplyById = catchAsync(async (req: Request, res: Response) => {
  const { replyId } = req.params;
  const reply = await ReplyService.getReplyById(replyId);

  if (!reply) throw new Error("Reply not found");

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Reply fetched successfully",
    data: reply,
  });
});

// Update a reply
const updateReply = catchAsync(async (req: Request, res: Response) => {
  const { replyId } = req.params;
  const userId = req.user?.id;

  const result = await ReplyService.updateReply(
    replyId,
    userId,
    req.body
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: result.data,
  });
});

// Delete a reply
const deleteReply = catchAsync(async (req: Request, res: Response) => {
  const { replyId } = req.params;
   const userId = req.user?.id;

  const reply = await ReplyService.deleteReply(replyId,userId);

  if (!reply) throw new Error("Reply not found or cannot delete");

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message:reply.message,
    data: reply.data,
  });
});

export const ReplyController = {
  createReply,
  getReplyById,
  updateReply,
  deleteReply,
};