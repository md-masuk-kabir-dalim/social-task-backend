import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { CommentService } from "./comment.service";

const createComment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const payload = {
    ...req.body,
    author: userId, 
  };

  const result = await CommentService.createComment(payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Comment created successfully",
    data: result,
  });
});

const getCommentById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await CommentService.getCommentById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comment retrieved successfully",
    data: result,
  });
});

const updateComment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const result = await CommentService.updateComment(id, updateData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comment updated successfully",
    data: result,
  });
});


const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await CommentService.deleteComment(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comment deleted successfully",
    data: result,
  });
});


const getCommentsByPost = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const userId = req.user?.id;
  const result = await CommentService.getCommentForPostId(postId, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comments retrieved successfully",
    data: result,
  });
});

export const CommentController = {
  createComment,
  getCommentById,
  updateComment,
  deleteComment,
  getCommentsByPost,
};