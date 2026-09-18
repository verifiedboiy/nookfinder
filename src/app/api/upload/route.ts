import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const files = formData.getAll('files') as File[];

    if (!file && (!files || files.length === 0)) {
      return NextResponse.json(
        { success: false, error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Handle single file upload
    if (file && typeof file === 'object' && 'arrayBuffer' in file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result = await uploadToCloudinary(buffer, file.name);

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error || 'Failed to upload to Cloudinary' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        url: result.url,
        publicId: result.publicId,
      });
    }

    // Handle batch files upload
    if (files && files.length > 0) {
      const uploadedUrls: string[] = [];

      for (const item of files) {
        if (item && typeof item === 'object' && 'arrayBuffer' in item) {
          const arrayBuffer = await item.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const result = await uploadToCloudinary(buffer, item.name);
          if (result.success && result.url) {
            uploadedUrls.push(result.url);
          }
        }
      }

      return NextResponse.json({
        success: true,
        urls: uploadedUrls,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid file payload' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('API /api/upload error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server upload failed' },
      { status: 500 }
    );
  }
}
