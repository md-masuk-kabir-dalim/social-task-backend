import { Types } from "mongoose";
import { PostModel } from "./post.model";
import { IPost } from "./post.interface";

/* =========================
   CREATE POST
========================= */
const createPost = async (payload: Partial<IPost>) => {
  const post = await PostModel.create(payload);

  return {
    message: "Post created successfully",
    data: post,
  };
};

/* =========================
   GET POST BY ID
========================= */
const getPostById = async (id: string) => {
  const post = await PostModel.findById(id)
    .populate("author", "fullName image")
    .populate("likesCount")
    .populate("commentsCount");

  if (!post) {
    throw new Error("Post not found");
  }

  return {
    message: "Post retrieved successfully",
    data: post,
  };
};

/* =========================
   UPDATE POST (SAFE)
========================= */
const updatePost = async (id: string, payload: Partial<IPost>) => {
  const post = await PostModel.findByIdAndUpdate(id, payload, {
    new: true,
  });

  if (!post) throw new Error("Post not found");

  return {
    message: "Post updated successfully",
    data: post,
  };
};

/* =========================
   DELETE POST
========================= */
const deletePost = async (id: string) => {
  const post = await PostModel.findByIdAndDelete(id);

  if (!post) throw new Error("Post not found");

  return {
    message: "Post deleted successfully",
    data: post,
  };
};

/* =========================
   FEED 
========================= */
 const getPostsForFeed = async (
  userId: string,
  page = 1,
  limit = 10,
  searchText = "",
) => {
  const skip = (page - 1) * limit;
  const userObjectId = new Types.ObjectId(userId);

  const matchStage: any = {
    policy: "PUBLISH",
  };

  if (Types.ObjectId.isValid(userId)) {
    matchStage.$or = [
      { author: userObjectId },
      { policy: "PUBLISH" },
    ];
  }

  const posts = await PostModel.aggregate([
    { $match: matchStage },

    // author
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        pipeline: [
          { $project: { fullName: 1, image: 1 } },
        ],
        as: "author",
      },
    },
    { $unwind: "$author" },

    // likes
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "post",
        as: "likes",
      },
    },

    // comments
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "post",
        as: "comments",
      },
    },

    // compute
    {
      $addFields: {
        likesCount: { $size: "$likes" },
        commentsCount: { $size: "$comments" },

        isLikeMe: {
          $gt: [
            {
              $size: {
                $filter: {
                  input: "$likes",
                  as: "l",
                  cond: {
                    $eq: ["$$l.user", userObjectId],
                  },
                },
              },
            },
            0,
          ],
        },
      },
    },

    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },

    {
      $project: {
        likes: 0,
        comments: 0,
        __v: 0,
      },
    },
  ]);

  const total = await PostModel.countDocuments(matchStage);

  return {
    message: "Feed retrieved successfully",
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: posts,
  };
};

export const PostService = {
  createPost,
  getPostById,
  updatePost,
  deletePost,
  getPostsForFeed,
};