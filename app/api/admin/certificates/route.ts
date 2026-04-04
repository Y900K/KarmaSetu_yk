import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { COLLECTIONS } from '@/lib/db/collections';
import { requireAdmin } from '@/lib/auth/requireAdmin';

type CertificateRow = {
  certNo: string;
  trainee: string;
  course: string;
  issueDate: string;
  expiry: string;
  score: number;
  status: 'Valid' | 'Expired' | 'Revoked';
};

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

function normalizeStatus(status: unknown, expiresAt: unknown): 'Valid' | 'Expired' | 'Revoked' {
  if (status === 'revoked') {
    return 'Revoked';
  }

  if (expiresAt instanceof Date && expiresAt.getTime() < Date.now()) {
    return 'Expired';
  }

  return 'Valid';
}

function toObjectId(value: unknown): ObjectId | null {
  if (typeof value !== 'string' || !ObjectId.isValid(value)) {
    return null;
  }

  return new ObjectId(value);
}

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(request);
    if (!admin.ok) {
      return admin.response;
    }

    const { db } = admin;
    const certificates = await db.collection(COLLECTIONS.certificates).find({}).sort({ issuedAt: -1 }).toArray();

    const userIds = certificates
      .map((certificate) => toObjectId(certificate.userId))
      .filter((id): id is ObjectId => Boolean(id));

    const courseIds = certificates
      .map((certificate) => toObjectId(certificate.courseId))
      .filter((id): id is ObjectId => Boolean(id));

    const [users, courses] = await Promise.all([
      userIds.length ? db.collection(COLLECTIONS.users).find({ _id: { $in: userIds } }).toArray() : [],
      courseIds.length ? db.collection(COLLECTIONS.courses).find({ _id: { $in: courseIds } }).toArray() : [],
    ]);

    const userMap = new Map(users.map((user) => [user._id.toString(), user]));
    const courseMap = new Map(courses.map((course) => [course._id.toString(), course]));

    const rows: CertificateRow[] = certificates.map((certificate) => {
      const user = typeof certificate.userId === 'string' ? userMap.get(certificate.userId) : undefined;
      const course = typeof certificate.courseId === 'string' ? courseMap.get(certificate.courseId) : undefined;

      return {
        certNo: typeof certificate.certNo === 'string' ? certificate.certNo : 'NA',
        trainee: typeof user?.fullName === 'string' ? user.fullName : 'Trainee User',
        course: typeof course?.title === 'string' ? course.title : 'Industrial Training Course',
        issueDate: formatDate(certificate.issuedAt),
        expiry: formatDate(certificate.expiresAt),
        score: typeof certificate.score === 'number' ? certificate.score : 0,
        status: normalizeStatus(certificate.status, certificate.expiresAt),
      };
    });

    return NextResponse.json({ ok: true, certificates: rows });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to load certificates.',
        details: process.env.NODE_ENV === 'development' ? details : undefined,
      },
      { status: 500 }
    );
  }
}
