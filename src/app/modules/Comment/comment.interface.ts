import { Types } from "mongoose";

export interface IComment {
  post: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}



export interface ICommentWithLikes extends IComment {
  _id: Types.ObjectId;                   
  isLikedByCurrentUser?: boolean;        
  replies?: (IComment & {              
    _id: Types.ObjectId;
    isLikedByCurrentUser?: boolean;
  })[];
}