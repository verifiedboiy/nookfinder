import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'eamqdjfo';
const API_KEY = process.env.CLOUDINARY_API_KEY || '882323531432825';
const API_SECRET = process.env.CLOUDINARY_API_SECRET || 'iQ7ktyMOko_HOEzMXN85FCUOS98';

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
  secure: true,
});

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  fileName?: string,
  folder: string = 'nookfinder/properties'
): Promise<{ success: boolean; url: string; publicId?: string; error?: string }> {
  try {
    return await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { quality: 'auto:good', fetch_format: 'auto' },
            { width: 1920, height: 1080, crop: 'limit' },
          ],
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            console.error('Cloudinary upload error:', error);
            resolve({
              success: false,
              url: '',
              error: error?.message || 'Failed to upload image to Cloudinary',
            });
          } else {
            resolve({
              success: true,
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        }
      );

      uploadStream.end(fileBuffer);
    });
  } catch (err: any) {
    console.error('Cloudinary helper exception:', err);
    return {
      success: false,
      url: '',
      error: err?.message || 'Upload processing error',
    };
  }
}

export default cloudinary;
