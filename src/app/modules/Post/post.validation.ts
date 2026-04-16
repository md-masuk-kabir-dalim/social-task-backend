import { z } from "zod";

/* ======================
   CREATE POST
====================== */
const createPostSchema = z.object({
  body: z.object({
    content: z
      .string()
      .min(1, "Content is required")
      .max(5000, "Content too long"),

    policy: z.enum(["PUBLISH", "PRIVATE"]).optional(),

    image: z
      .object({
        url: z.string().url("Invalid image URL"),
        altText: z.string().min(1, "Alt text is required"),
        description: z.string().optional(),
        publicId: z.string().min(1, "Public ID is required"),
      })
      .optional(),
  }),
});

/* ======================
   UPDATE POST
====================== */
const updatePostSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(5000).optional(),

    policy: z.enum(["PUBLISH", "PRIVATE"]).optional(),

    image: z
      .object({
        url: z.string().url(),
        altText: z.string().min(1),
        description: z.string().optional(),
        publicId: z.string().min(1),
      })
      .optional(),
  }),
});

/* ======================
   FEED QUERY
====================== */
const postFeedQuerySchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Number(val)), {
        message: "Page must be a number",
      }),

    limit: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Number(val)), {
        message: "Limit must be a number",
      }),

    search: z.string().optional(),
  }),
});

/* ======================
   EXPORT
====================== */
export const PostValidation = {
  createPostSchema,
  updatePostSchema,
  postFeedQuerySchema,
};