import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { PostService } from "./post.service";
import httpStatus from "http-status";

/* =========================
   CREATE POST
========================= */
const createPost = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const result = await PostService.createPost({
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

/* =========================
   GET POST BY ID
========================= */
const getPostById = catchAsync(async (req: Request, res: Response) => {
  const result = await PostService.getPostById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.data,
  });
});

/* =========================
   UPDATE POST
========================= */
const updatePost = catchAsync(async (req: Request, res: Response) => {
  const result = await PostService.updatePost(req.params.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.data,
  });
});

/* =========================
   DELETE POST
========================= */
const deletePost = catchAsync(async (req: Request, res: Response) => {
  const result = await PostService.deletePost(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.data,
  });
});

/* =========================
   FEED (PAGINATED)
========================= */
const getPostsForFeed = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const result = await PostService.getPostsForFeed(
    userId,
    Number(req.query.page) || 1,
    Number(req.query.limit) || 10,
    String(req.query.search || "")
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.data,
    meta: result.meta,
  });
});

export const PostController = {
  createPost,
  getPostById,
  updatePost,
  deletePost,
  getPostsForFeed,
};