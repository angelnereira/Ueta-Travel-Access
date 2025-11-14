import { NextRequest, NextResponse } from 'next/server';
import { objectStorage } from '@/lib/storage/object-storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/upload - Upload image to Object Storage
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'products';
    const name = formData.get('name') as string || file.name;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Object Storage
    const result = await objectStorage.uploadImage(buffer, name, folder);

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        objectName: result.objectName,
        bucket: result.bucket
      }
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

// GET /api/upload - Get presigned URL for temporary access
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const objectName = searchParams.get('object');
    const hours = parseInt(searchParams.get('hours') || '24');

    if (!objectName) {
      return NextResponse.json(
        { success: false, error: 'Object name required' },
        { status: 400 }
      );
    }

    const url = await objectStorage.createPreAuthenticatedRequest(objectName, hours);

    return NextResponse.json({
      success: true,
      data: {
        url,
        expiresIn: `${hours} hours`
      }
    });
  } catch (error: any) {
    console.error('Error creating presigned URL:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/upload - Delete image from Object Storage
export async function DELETE(request: NextRequest) {
  try {
    const { objectName } = await request.json();

    if (!objectName) {
      return NextResponse.json(
        { success: false, error: 'Object name required' },
        { status: 400 }
      );
    }

    await objectStorage.deleteFile(objectName);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
