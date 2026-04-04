import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getMongoDb } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/db/collections';

function asObjectId(value: unknown): ObjectId | null {
  if (typeof value !== 'string' || !ObjectId.isValid(value)) {
    return null;
  }

  return new ObjectId(value);
}

function formatDate(value: unknown): string | undefined {
  if (!(value instanceof Date)) {
    return undefined;
  }

  return value.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export async function GET(_: Request, { params }: { params: Promise<{ certId: string }> }) {
  try {
    const { certId } = await params;

    const db = await getMongoDb();
    const cert = await db.collection(COLLECTIONS.certificates).findOne({ certNo: certId });

    if (cert) {
      const userId = asObjectId(cert.userId);
      const courseId = asObjectId(cert.courseId);

      const [user, course] = await Promise.all([
        userId ? db.collection(COLLECTIONS.users).findOne({ _id: userId }) : null,
        courseId ? db.collection(COLLECTIONS.courses).findOne({ _id: courseId }) : null,
      ]);

      const expiresAt = cert.expiresAt instanceof Date ? cert.expiresAt : undefined;
      const status = typeof cert.status === 'string' ? cert.status : 'valid';
      const isValid = status === 'valid' && (!expiresAt || expiresAt.getTime() > Date.now());

      return NextResponse.json({
        ok: true,
        valid: isValid,
        certificate: {
          certNo: cert.certNo,
          trainee: typeof user?.fullName === 'string' ? user.fullName : 'Trainee User',
          course: typeof course?.title === 'string' ? course.title : 'Industrial Training Course',
          score: typeof cert.score === 'number' ? cert.score : 0,
          status,
          issueDate: formatDate(cert.issuedAt) || 'NA',
          expiry: formatDate(expiresAt) || 'NA',
        },
      });
    }

    return NextResponse.json(
      {
        ok: false,
        valid: false,
        message: 'Certificate not found.',
      },
      { status: 404 }
    );
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        ok: false,
        valid: false,
        message: 'Failed to verify certificate.',
        details: process.env.NODE_ENV === 'development' ? details : undefined,
      },
      { status: 500 }
    );
  }
}
