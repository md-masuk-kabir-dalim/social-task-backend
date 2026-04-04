import {  Types } from "mongoose";
import { IPost } from "./post.interface";
import { PostModel } from "./post.model";
import { searchPaginate } from "../../../helpers/searchAndPaginate";
const isValidObjectId = (id: string) => Types.ObjectId.isValid(id);

const createPost = async (postData: Partial<IPost>): Promise<IPost> => {
  const created = await PostModel.create(postData);
  return created;
};


const getPostById = async (postId: string): Promise<IPost | null> => {
  const post = await PostModel.findById(postId)
    .populate("author", "name email")
    .populate("likesCount")
    .populate("commentsCount")
    .populate({
      path: "comments",
      populate: { path: "author", select: "name email" },
    });
  return post;
};

const updatePost = async (
  postId: string,
  updateData: Partial<IPost>,
): Promise<IPost | null> => {
  const post = await PostModel.findByIdAndUpdate(postId, updateData, {
    new: true,
  });
  return post;
};

const deletePost = async (postId: string): Promise<IPost | null> => {
  const post = await PostModel.findByIdAndDelete(postId);
  return post;
};


const getPostsForFeed = async (
  userId: string,
  page = 1,
  limit = 10,
  searchText = ""
) => {
  const skip = (page - 1) * limit;

  const filters: any = {};

  if (Types.ObjectId.isValid(userId)) {
    filters.$or = [
      { author: new Types.ObjectId(userId) },
      { policy: "PUBLISH" },                 
    ];
  } else {
    filters.policy = "PUBLISH";
  }

  const [data, total] = await Promise.all([
    PostModel.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "fullName image")
      .lean(),

    PostModel.countDocuments(filters),
  ]);

  const postsWithCounts = await PostModel.populate(data, [
    { path: "likesCount" },
    { path: "commentsCount" },
     { path: "likes" },
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: postsWithCounts,
  };
};


export const PostService = {
  createPost,
  getPostById,
  updatePost,
  deletePost,
  getPostsForFeed,
};
