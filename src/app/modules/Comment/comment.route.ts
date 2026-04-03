import express from "express";
import { CommentController } from "./comment.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post("/", auth(), CommentController.createComment);
router.get("/:id", CommentController.getCommentById);
router.patch("/:id", auth(), CommentController.updateComment);
router.delete("/:id", auth(), CommentController.deleteComment);

router.get("/post/:postId", CommentController.getCommentsByPost);

export const CommentRoutes = router;