import { Schema, model, Types } from "mongoose";
import { IComment } from "./comment.interface";

const CommentSchema = new Schema<IComment>(
  {
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// -------------------
// Virtuals
// -------------------

// Replies of comment
CommentSchema.virtual("replies", {
  ref: "Reply",
  localField: "_id",
  foreignField: "comment",
});

// Total likes of comment
CommentSchema.virtual("likes", {
  ref: "Like",
  localField: "_id",
  foreignField: "comment",
});


CommentSchema.virtual("likesCount", {
  ref: "Like",
  localField: "_id",
  foreignField: "comment",
  count:true
});

export const CommentModel = model<IComment>("Comment", CommentSchema);
