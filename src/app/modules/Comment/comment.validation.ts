import { z } from "zod";

const createCommentSchema = z.object({
  body: z.object({
    post: z.string().min(1, "Post ID is required"),
    content: z
      .string()
      .min(1, "Comment cannot be empty")
      .max(2000, "Comment too long"),
  }),
});

const updateCommentSchema = z.object({
  body: z.object({
    content: z
      .string()
      .min(1, "Comment cannot be empty")
      .max(2000, "Comment too long"),
  }),
});

const getCommentsByPostSchema = z.object({
  params: z.object({
    postId: z.string().min(1, "Post ID is required"),
  }),
});

export const CommentValidation={
createCommentSchema,
updateCommentSchema,
getCommentsByPostSchema
}