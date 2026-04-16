import { Router } from "express";
import { LikeController } from "./like.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { LikeValidation } from "./like.validation";

const router =Router()

router.post ("/",auth(), validateRequest(LikeValidation.toggleLikeSchema), LikeController.toggleLike)

export const LikeRoutes = router;