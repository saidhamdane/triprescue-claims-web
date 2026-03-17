import { NextRequest, NextResponse } from 'next/server';
import { cloudinary } from '../../../lib/cloudinary';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileBase64, folder = 'triprescue-evidence' } = body || {};

    if (!fileBase64) {
      return NextResponse.json({ error: 'Missing fileBase64' }, { status: 400 });
    }

    const result = await cloudinary.uploader.upload(fileBase64, {
      folder,
      resource_type: 'auto',
    });

    return NextResponse.json({
      ok: true,
      file_url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      bytes: result.bytes,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
