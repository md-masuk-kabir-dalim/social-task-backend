import { Types } from "mongoose";
import { IComment } from "./comment.interface";
import { CommentModel } from "./comment.model";
import ApiError from "../../../errors/ApiErrors";

const assertOwner = (ownerId: any, userId: string) => {
  if (ownerId.toString() !== userId) {
    throw new ApiError(403, "Forbidden");
  }
};


/* ======================
   CREATE COMMENT
====================== */
const createComment = async (payload: Partial<IComment>) => {
  const comment = await CommentModel.create(payload);

  return {
    message: "Comment created successfully",
    data: comment,
  };
};

/* ======================
   GET COMMENT BY ID
====================== */
const getCommentById = async (id: string) => {
  const comment = await CommentModel.findById(id)
    .populate("author", "fullName image")
    .populate("likes")
    .populate({
      path: "replies",
      populate: { path: "author", select: "fullName image" },
    });

  if (!comment) {
    throw new Error("Comment not found");
  }

  return {
    message: "Comment retrieved successfully",
    data: comment,
  };
};

/* ======================
   UPDATE COMMENT
====================== */
const updateComment = async (
  id: string,
  userId: string,
  payload: Partial<IComment>
) => {
  const comment = await CommentModel.findById(id);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  assertOwner(comment.author, userId);

  const updated = await CommentModel.findByIdAndUpdate(id, payload, {
    new: true,
  });

  return {
    message: "Comment updated successfully",
    data: updated,
  };
};


/* ======================
   DELETE COMMENT
====================== */
const deleteComment = async (id: string, userId: string) => {
  const comment = await CommentModel.findById(id);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }
 
  assertOwner(comment.author, userId);

  await CommentModel.findByIdAndDelete(id);

  return {
    message: "Comment deleted successfully",
    data: null,
  };
};

/* ======================
   GET COMMENT BY POST ID
====================== */
const getCommentForPostId = async (postId: string, userId: string) => {
  const userObjectId = new Types.ObjectId(userId);

  const comments = await CommentModel.aggregate([
    {
      $match: {
        post: new Types.ObjectId(postId),
      },
    },

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

    // COMMENT LIKES
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "commentLikes",
      },
    },

    // REPLIES
    {
      $lookup: {
        from: "replies",
        localField: "_id",
        foreignField: "comment",
        as: "replies",
      },
    },

    // REPLY AUTHOR
    {
      $lookup: {
        from: "users",
        localField: "replies.author",
        foreignField: "_id",
        pipeline: [
          { $project: { fullName: 1, image: 1 } },
        ],
        as: "replyAuthors",
      },
    },

    // REPLY LIKES
    {
      $lookup: {
        from: "likes",
        localField: "replies._id",
        foreignField: "reply",
        as: "replyLikes",
      },
    },

    // COMPUTE
    {
      $addFields: {
        likesCount: { $size: "$commentLikes" },

        isLikeMe: {
          $in: [userObjectId, "$commentLikes.user"],
        },

        replies: {
          $map: {
            input: "$replies",
            as: "r",
            in: {
              _id: "$$r._id",
              content: "$$r.content",
              createdAt: "$$r.createdAt",

              author: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$replyAuthors",
                      as: "a",
                      cond: {
                        $eq: ["$$a._id", "$$r.author"],
                      },
                    },
                  },
                  0,
                ],
              },

              likesCount: {
                $size: {
                  $filter: {
                    input: "$replyLikes",
                    as: "l",
                    cond: {
                      $eq: ["$$l.reply", "$$r._id"],
                    },
                  },
                },
              },

              isLikeMe: {
                $in: [
                  userObjectId,
                  {
                    $map: {
                      input: {
                        $filter: {
                          input: "$replyLikes",
                          as: "l",
                          cond: {
                            $eq: ["$$l.reply", "$$r._id"],
                          },
                        },
                      },
                      as: "x",
                      in: "$$x.user",
                    },
                  },
                ],
              },
            },
          },
        },
      },
    },

    {
      $project: {
        commentLikes: 0,
        replyLikes: 0,
        replyAuthors: 0,
      },
    },

    { $sort: { createdAt: -1 } },
  ]);

  return {
    message: "Comments retrieved successfully",
    data: comments,
  };
}

export const CommentService = {
  createComment,
  getCommentById,
  updateComment,
  deleteComment,
  getCommentForPostId,
};
