import { Schema, model } from "mongoose";
import { ImageSchema } from "../Image/image.model";
import { IPost } from "./post.interface";

const PostSchema = new Schema<IPost>(
  {
    content: { type: String, required: true },
     image: {
      type: ImageSchema,
      required: false,
    },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    policy: {
      type: String,
      enum: ["PUBLISH", "PRIVATE"],
      default: "PUBLISH",
    },
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

// Total likes for post
PostSchema.virtual("likesCount", {
  ref: "Like",
  localField: "_id",
  foreignField: "post",
  count: true,
});

// Total comments for post
PostSchema.virtual("commentsCount", {
  ref: "Comment",
  localField: "_id",
  foreignField: "post",
  count: true,
});

// Array of comments
PostSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "post",
});

PostSchema.index({ content: "text" });

export const PostModel = model<IPost>("Post", PostSchema);
