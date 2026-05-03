import StorageService from "../infra/storage/storageService";

interface IUploadRepository {
  uploadToCloud(file: Express.Multer.File, folder: string): Promise<any>;
  deleteFromCloud(publicId: string): Promise<any>;
}

const storageService = new StorageService();

class UploadRepository implements IUploadRepository {

  async uploadToCloud(file: Express.Multer.File, folder: string): Promise<any> {
    return storageService.uploadFile(file, folder);
  }

  async deleteFromCloud(publicId: string): Promise<any> {
    return storageService.deleteFile(publicId);
  }
}

export default UploadRepository
