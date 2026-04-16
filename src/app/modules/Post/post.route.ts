import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { PostController } from "./post.controller";
import { PostValidation } from "./post.validation";

const router = Router();

router.post(
  "/",
  auth(),
  validateRequest(PostValidation.createPostSchema),
  PostController.createPost
);

router.get("/feed", auth(), PostController.getPostsForFeed);

router.get("/:id", auth(), PostController.getPostById);

router.patch(
  "/:id",
  auth(),
  validateRequest(PostValidation.updatePostSchema),
  PostController.updatePost
);

router.delete("/:id", auth(), PostController.deletePost);

export const PostRoutes = router;