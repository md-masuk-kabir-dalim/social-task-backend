import { z } from "zod";

const createReplySchema = z.object({
  body: z.object({
    commentId: z.string().min(1, "commentId is required"),
    content: z.string().min(1, "content is required"),
  }),
});

const updateReplySchema = z.object({
  body: z.object({
    content: z.string().min(1, "content is required"),
  }),
  params: z.object({
    replyId: z.string().min(1, "replyId is required"),
  }),
});

const replyIdSchema = z.object({
  params: z.object({
    replyId: z.string().min(1, "replyId is required"),
  }),
});

export const ReplyValidation = {
  createReplySchema,
  updateReplySchema,
  replyIdSchema,
};