import express from "express";
import { upload } from "../../middlewares/upload ";
import { validateMaliciousFile } from "../../middlewares/validateFile";
import { ImageController } from "./image.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/upload",
  auth(),
  upload.single("file"),
  // validateMaliciousFile,
  ImageController.uploadImage
);
router.delete("/delete", auth(), ImageController.deleteImage);
router.patch(
  "/update",  
  auth(),
  upload.single("file"),
  validateMaliciousFile,
  ImageController.updateImage
);

export const ImageRoutes = router;
