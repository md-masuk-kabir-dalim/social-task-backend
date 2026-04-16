import { z } from "zod";

const toggleLikeSchema = z.object({
  body: z
    .object({
      postId: z.string().optional(),
      commentId: z.string().optional(),
      replyId: z.string().optional(),
      type: z.enum(["like", "dislike"]).optional(),
    })
    .superRefine((data, ctx) => {
      const count = [data.postId, data.commentId, data.replyId].filter(
        Boolean
      ).length;

      if (count !== 1) {
        ctx.addIssue({
          code: "custom",
          path: ["body"],
          message: "Provide exactly one target (post/comment/reply)",
        });
      }
    }),
});

export const LikeValidation = {
  toggleLikeSchema,
};