import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { PostService } from "./post.service";
import httpStatus from "http-status";

const createPost = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const postData = {
    ...req.body,
  }
  
  if (userId) postData.author = userId;

  const result = await PostService.createPost(postData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Post created successfully",
    data: result,
  });
});

const getPostById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PostService.getPostById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post retrieved successfully",
    data: result,
  });
});

const updatePost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;
  const result = await PostService.updatePost(id, updateData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post updated successfully",
    data: result,
  });
});

const deletePost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PostService.deletePost(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post deleted successfully",
    data: result,
  });
});

const getPostsForFeed = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { page, limit, search } = req.query;

  const result = await PostService.getPostsForFeed(
    userId!,
    Number(page) || 1,
    Number(limit) || 10,
    String(search) || "",
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Posts retrieved successfully",
    data: result.data,
    meta:result.meta,
  });
});

export const PostController = {
  createPost,
  getPostById,
  updatePost,
  deletePost,
  getPostsForFeed,
};
