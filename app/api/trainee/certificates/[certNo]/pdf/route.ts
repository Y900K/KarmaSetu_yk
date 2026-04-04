import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { COLLECTIONS } from '@/lib/db/collections';
import { buildCertificatePdf } from '@/lib/certificates/pdf';
import { requireTrainee } from '@/lib/auth/requireTrainee';

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
    const trainee = await requireTrainee(request);
    if (!trainee.ok) {
      return trainee.response;
    }

    const { db, session } = trainee;

    const { certNo } = await params;
    const certificate = await db
      .collection(COLLECTIONS.certificates)
      .findOne({ certNo, userId: session.user._id.toString() });

    if (!certificate) {
      return NextResponse.json({ ok: false, message: 'Certificate not found.' }, { status: 404 });
    }

    const course = typeof certificate.courseId === 'string' && ObjectId.isValid(certificate.courseId)
      ? await db.collection(COLLECTIONS.courses).findOne({ _id: new ObjectId(certificate.courseId) })
      : null;

    const pdfBytes = await buildCertificatePdf({
      certNo,
      trainee: typeof session.user.fullName === 'string' ? session.user.fullName : 'Trainee User',
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
