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
  const updateData = req.body;

  const reply = await ReplyService.updateReply(replyId, updateData);

  if (!reply) throw new Error("Reply not found or cannot update");

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Reply updated successfully",
    data: reply,
  });
});

// Delete a reply
const deleteReply = catchAsync(async (req: Request, res: Response) => {
  const { replyId } = req.params;

  const reply = await ReplyService.deleteReply(replyId);

  if (!reply) throw new Error("Reply not found or cannot delete");

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Reply deleted successfully",
    data: reply,
  });
});

export const ReplyController = {
  createReply,
  getReplyById,
  updateReply,
  deleteReply,
};