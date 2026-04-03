import express from "express";
import { ReplyController } from "./reply.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post("/create", auth(), ReplyController.createReply);

router.get("/:replyId", auth(), ReplyController.getReplyById);

router.patch("/:replyId", auth(), ReplyController.updateReply);

router.delete("/:replyId", auth(), ReplyController.deleteReply);

export const ReplyRoutes = router;