import express from "express";
import { ReplyController } from "./reply.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { ReplyValidation } from "./reply.validation";

const router = express.Router();

/* ======================
   CREATE REPLY
====================== */
router.post(
  "/create",
  auth(),
  validateRequest(ReplyValidation.createReplySchema),
  ReplyController.createReply
);

/* ======================
   GET REPLY BY ID
====================== */
router.get(
  "/:replyId",
  auth(),
  validateRequest(ReplyValidation.replyIdSchema),
  ReplyController.getReplyById
);

/* ======================
   UPDATE REPLY
====================== */
router.patch(
  "/:replyId",
  auth(),
  validateRequest(ReplyValidation.updateReplySchema),
  ReplyController.updateReply
);

/* ======================
   DELETE REPLY
====================== */
router.delete(
  "/:replyId",
  auth(),
  validateRequest(ReplyValidation.replyIdSchema),
  ReplyController.deleteReply
);

export const ReplyRoutes = router;