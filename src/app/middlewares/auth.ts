import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../config";
import ApiError from "../../errors/ApiErrors";
import { UserModel } from "../modules/User/user.model";
import { clearCookie, getCookieName } from "../../utils/cookieHelper";
import { jwtHelpers } from "../../utils/jwtHelpers";

const auth = (...roles: string[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const url = req.originalUrl;
      let token: string | undefined;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }

      if (!token) {
        const accessCookie = getCookieName("ACCESS");
        const otpCookie = getCookieName("OTP");

        if (url.includes("/otp/verify")) {
          token = req.cookies?.[otpCookie];
        } else {
          token = req.cookies?.[accessCookie];
        }
      }

      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
      }

      let secret: Secret;

      if (url.includes("/refresh-token")) {
        secret = config.jwt.refresh_secret;
      } else if (url.includes("/otp/verify")) {
        secret = config.jwt.verification_secret;
      } else if (url.includes("/reset-password")) {
        secret = config.jwt.password_reset_secret;
      } else {
        secret = config.jwt.access_secret;
      }

      let verifiedUser: any = jwtHelpers.verifyToken(token, secret);

      console.log(verifiedUser);

      const user = await UserModel.findOne({ email: verifiedUser.email });

      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "This user is not found!");
      }

      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
      }

      req.user = verifiedUser;

      next();
    } catch (err) {
      clearCookie(res, "ACCESS");
      clearCookie(res, "REFRESH");
      clearCookie(res, "OTP");
      next(err);
    } 
  };
};

export default auth;
