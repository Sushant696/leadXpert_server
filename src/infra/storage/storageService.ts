import streamifier from 'streamifier';
import { UploadApiResponse } from "cloudinary";

import cloudinary from "./cloudinary";
class StorageService {
  async uploadFile(
    file: Express.Multer.File,
    folder: string = "leadXpert"
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({
        folder,
        resource_type: 'auto',
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: "auto" }
        ]
      },
        (error: any, result) => {
          if (error) reject(error) // throw error 
          else resolve(result as UploadApiResponse) // return response
        }
      );
      // 
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    })
  }

  async deleteFile(PublicId: string): Promise<any> {
    await cloudinary.uploader.destroy(PublicId);
  }
}

export default StorageService
