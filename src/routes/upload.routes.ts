import { Router } from "express";
import upload from "../middlewares/multer";
import UploadController from "../controller/upload.controller";
import { middlewares } from "../middlewares/isAuthenticated";

const uploadRouter = Router()
const uploadController = new UploadController();

uploadRouter.post('/image',
  middlewares.isAuthenticated,
  upload.single('image'),
  uploadController.uploadImage
);

// Multiple images upload
uploadRouter.post('/images',
  upload.array('images', 5),
  uploadController.uploadMultipleImages
);

// Delete image
uploadRouter.delete('/image',
  uploadController.deleteImage
);

export default uploadRouter;
