import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { imageService } from "./image.service";
import ApiError from "../../../errors/ApiErrors";
import sendResponse from "../../../shared/sendResponse";

const uploadImage = catchAsync(async (req: Request, res: Response) => {
  console.log("hoyyyyyyyyyyyyyyyyyyy")
  if (!req.file) throw new ApiError(404, "No file uploaded");
  const folder = "social_images";
  const result: any = await imageService.uploadToCloudinary(
    req.file.buffer,
    folder
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Image uploaded successfully",
    data: {
      public_id: result.public_id,
      secure_url: result.secure_url,
    },
  });
});

const deleteImage = catchAsync(async (req: Request, res: Response) => {
  const { publicId } = req.body;
  if (!publicId) throw new Error("Public ID required");

  await imageService.deleteFromCloudinary(publicId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Image deleted successfully",
  });
});

const updateImage = catchAsync(async (req: Request, res: Response) => {
  const { oldPublicId } = req.body;
  if (!req.file) throw new Error("No file uploaded");

  if (oldPublicId) await imageService.deleteFromCloudinary(oldPublicId);

  const result: any = await imageService.uploadToCloudinary(
    req.file.buffer,
    "profile_images"
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Image updated successfully",
    data: {
      public_id: result.public_id,
      secure_url: result.secure_url,
    },
  });
});

export const ImageController = {
  uploadImage,
  deleteImage,
  updateImage,
};
