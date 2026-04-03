import express from "express";
import { AuthRoutes } from "../modules/Auth/auth.routes";
import { UserRoutes } from "../modules/User/user.routes";
import { ImageRoutes } from "../modules/Image/image.routes";
import { PostRoutes } from "../modules/Post/post.route";
import { CommentRoutes } from "../modules/Comment/comment.route";
import { LikeRoutes } from "../modules/Like/like.route";
import { ReplyRoutes } from "../modules/Reply/reply.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/image",
    route: ImageRoutes,
  },
  {
    path:"/posts",
    route:PostRoutes
  },
  {
    path:"/comments",
    route:CommentRoutes
  },
  {
    path:"/likes",
    route:LikeRoutes
  },
  {
    path:"/replies",
    route: ReplyRoutes
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
