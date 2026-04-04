import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { COLLECTIONS } from '@/lib/db/collections';
import { buildCertificatePdf } from '@/lib/certificates/pdf';
import { requireAdmin } from '@/lib/auth/requireAdmin';

function formatDate(value: unknown): string {
  if (!(value instanceof Date)) {
    return 'NA';
  }

  return value.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export async function GET(request: Request, { params }: { params: Promise<{ certNo: string }> }) {
  try {
    const admin = await requireAdmin(request);
    if (!admin.ok) {
      return admin.response;
    }

    const { db } = admin;
    const { certNo } = await params;

    const certificate = await db.collection(COLLECTIONS.certificates).findOne({ certNo });
    if (!certificate) {
      return NextResponse.json({ ok: false, message: 'Certificate not found.' }, { status: 404 });
    }

    const [user, course] = await Promise.all([
      typeof certificate.userId === 'string' && ObjectId.isValid(certificate.userId)
        ? db.collection(COLLECTIONS.users).findOne({ _id: new ObjectId(certificate.userId) })
        : null,
      typeof certificate.courseId === 'string' && ObjectId.isValid(certificate.courseId)
        ? db.collection(COLLECTIONS.courses).findOne({ _id: new ObjectId(certificate.courseId) })
        : null,
    ]);

    const pdfBytes = await buildCertificatePdf({
      certNo,
      trainee: typeof user?.fullName === 'string' ? user.fullName : 'Trainee User',
      course: typeof course?.title === 'string' ? course.title : 'Industrial Training Course',
      issueDate: formatDate(certificate.issuedAt),
      expiry: formatDate(certificate.expiresAt),
      score: typeof certificate.score === 'number' ? certificate.score : 0,
      status: typeof certificate.status === 'string' ? certificate.status : 'valid',
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${certNo}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to generate certificate PDF.',
        details: process.env.NODE_ENV === 'development' ? details : undefined,
      },
      { status: 500 }
    );
  }
}
