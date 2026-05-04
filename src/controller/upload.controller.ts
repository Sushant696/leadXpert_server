import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import ApiResponse from '../utils/apiResponse';
import asyncHandler from '../utils/asyncHandler';
import UploadService from '../services/upload.services';
import responseMessages from '../constants/responseMessages';

const uploadService = new UploadService();

class UploadController {
  uploadImage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { folder, allowedTypes } = req.body;
    const result = await uploadService.uploadImage(
      req.file,
      folder,
      allowedTypes
    );

    return res.json(new ApiResponse(StatusCodes.OK, responseMessages.UPLOAD.CREATED, { result }))
  })

  uploadMultipleImages = asyncHandler(async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const { folder, allowedTypes } = req.body;

    const results = await uploadService.uploadMultipleImages(
      files,
      folder,
      allowedTypes
    );

    return res.json(new ApiResponse(StatusCodes.OK, responseMessages.UPLOAD.CREATED, { results }))
  })

  deleteImage = asyncHandler(async (req: Request, res: Response) => {
    const { publicId } = req.body;
    await uploadService.deleteImage(publicId);
    return res.json(new ApiResponse(StatusCodes.OK, responseMessages.UPLOAD.DELETED, {}))
  })
}

export default UploadController;
