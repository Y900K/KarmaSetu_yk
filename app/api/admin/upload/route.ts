import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(request);
    if (!admin.ok) {
      return admin.response;
    }

    const data = await request.formData();
    const file = data.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ ok: false, message: 'No file uploaded. Please attach a PDF.' }, { status: 400 });
    }

    if (file.size > 1024 * 1024) { // 1MB constraint
      return NextResponse.json({ ok: false, message: 'File is too large. Max size is 1MB.' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ ok: false, message: 'Only PDF files are allowed for course readings.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename and append timestamp against cache conflicts
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${Date.now()}-${safeName}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'courses');
    
    // Safety check: ensure dir exists
    await mkdir(uploadDir, { recursive: true }).catch(() => {});
    
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    return NextResponse.json({ 
      ok: true, 
      url: `/uploads/courses/${filename}`,
      message: 'File embedded successfully.'
    });
  } catch (error) {
    console.error('[Upload PDF API Error]', error);
    return NextResponse.json({ ok: false, message: 'Internal server error while uploading file.' }, { status: 500 });
  }
}
