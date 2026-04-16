import express from "express";
import { CommentController } from "./comment.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { CommentValidation } from "./comment.validation";

const router = express.Router();

/* CREATE COMMENT */
router.post(
  "/",
  auth(),
  validateRequest(CommentValidation.createCommentSchema),
  CommentController.createComment
);

/* GET COMMENTS BY POST */
router.get(
  "/post/:postId",
  auth(),
  CommentController.getCommentsByPost
);

/* GET COMMENT BY ID */
router.get("/:id", auth(), CommentController.getCommentById);

/* UPDATE COMMENT */
router.patch(
  "/:id",
  auth(),
  validateRequest(CommentValidation.updateCommentSchema),
  CommentController.updateComment
);

/* DELETE COMMENT */
router.delete("/:id", auth(), CommentController.deleteComment);

export const CommentRoutes = router;