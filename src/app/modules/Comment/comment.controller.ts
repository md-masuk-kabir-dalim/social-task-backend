import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { CommentService } from "./comment.service";

/* ======================
   CREATE COMMENT
====================== */
const createComment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const result = await CommentService.createComment({
    ...req.body,
    author: userId,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: result.message,
    data: result.data,
  });
});

/* ======================
   GET BY ID
====================== */
const getCommentById = catchAsync(async (req: Request, res: Response) => {
  const result = await CommentService.getCommentById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.data,
  });
});

/* ======================
   UPDATE
====================== */
const updateComment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await CommentService.updateComment(
    req.params.id,
    userId,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.data,
  });
});

/* ======================
   DELETE
====================== */
const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await CommentService.deleteComment(req.params.id,userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.data,
  });
});

/* ======================
   COMMENTS BY POST
====================== */
const getCommentsByPost = catchAsync(async (req: Request, res: Response) => {
  const result = await CommentService.getCommentForPostId(
    req.params.postId,
    req.user?.id
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.data,
  });
});

export const CommentController = {
  createComment,
  getCommentById,
  updateComment,
  deleteComment,
  getCommentsByPost,
};