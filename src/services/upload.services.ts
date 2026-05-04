import { StatusCodes } from "http-status-codes";

import ApiError from "../exceptions/apiError";
import { UploadResult } from "../types/upload.types";
import UploadRepository from "../repositories/upload.repository";

const uploadRepository = new UploadRepository();

class UploadService {
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'leadxpert/general',
    allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']
  ): Promise<UploadResult> {
    if (!allowedTypes.includes(file.mimetype)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Invalid file type. Allowed: ${allowedTypes.join(', ')}`
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'File size exceeds 5MB limit');
    }

    const result = await uploadRepository.uploadToCloud(file, folder);
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
      width: result.width,
      height: result.height
    };
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: string = 'leadxpert/general',
    allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map(file =>
      this.uploadImage(file, folder, allowedTypes)
    );

    return Promise.all(uploadPromises);
  }

  async deleteImage(publicId: string): Promise<void> {
    if (!publicId || publicId.trim() === '') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Public ID is required');
    }

    await uploadRepository.deleteFromCloud(publicId);
  }
}

export default UploadService
