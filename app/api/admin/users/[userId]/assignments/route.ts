import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { COLLECTIONS } from '@/lib/db/collections';
import { requireAdmin } from '@/lib/auth/requireAdmin';

type AssignmentRow = {
  courseId: string;
  courseTitle: string;
  status: string;
  progressPct: number;
  score?: number;
  assignedAt?: string;
  updatedAt?: string;
};

type AuditRow = {
  id: string;
  action: string;
  source: string;
  courseId: string;
  courseTitle: string;
  progressPct?: number;
  score?: number;
  createdAt: string;
};

function toIso(value: unknown): string | undefined {
  return value instanceof Date ? value.toISOString() : undefined;
}

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const admin = await requireAdmin(request);
    if (!admin.ok) {
      return admin.response;
    }

    const { db } = admin;
    const { userId } = await params;
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ ok: false, message: 'Invalid user id.' }, { status: 400 });
    }

    const user = await db.collection(COLLECTIONS.users).findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ ok: false, message: 'User not found.' }, { status: 404 });
    }

    const [enrollments, audits] = await Promise.all([
      db.collection(COLLECTIONS.enrollments).find({ userId }).sort({ updatedAt: -1 }).toArray(),
      db.collection(COLLECTIONS.enrollmentAudit).find({ userId }).sort({ createdAt: -1 }).limit(100).toArray(),
    ]);

    const courseIds = Array.from(
      new Set(
        [...enrollments.map((entry) => entry.courseId), ...audits.map((entry) => entry.courseId)].filter(
          (value): value is string => typeof value === 'string' && ObjectId.isValid(value)
        )
      )
    );

    const courses = courseIds.length
      ? await db
          .collection(COLLECTIONS.courses)
          .find({ _id: { $in: courseIds.map((id) => new ObjectId(id)) } })
          .project({ title: 1 })
          .toArray()
      : [];

    const courseMap = new Map(courses.map((course) => [course._id.toString(), String(course.title || 'Untitled Course')]));

    const assignments: AssignmentRow[] = enrollments.map((entry) => ({
      courseId: typeof entry.courseId === 'string' ? entry.courseId : 'unknown',
      courseTitle:
        typeof entry.courseId === 'string'
          ? courseMap.get(entry.courseId) || 'Training Course'
          : 'Training Course',
      status: typeof entry.status === 'string' ? entry.status : 'assigned',
      progressPct: typeof entry.progressPct === 'number' ? entry.progressPct : 0,
      score: typeof entry.score === 'number' ? entry.score : undefined,
      assignedAt: toIso(entry.assignedAt),
      updatedAt: toIso(entry.updatedAt),
    }));

    const timeline: AuditRow[] = audits.map((entry) => ({
      id: entry._id.toString(),
      action: typeof entry.action === 'string' ? entry.action : 'unknown',
      source: typeof entry.source === 'string' ? entry.source : 'unknown',
      courseId: typeof entry.courseId === 'string' ? entry.courseId : 'unknown',
      courseTitle:
        typeof entry.courseId === 'string'
          ? courseMap.get(entry.courseId) || 'Training Course'
          : 'Training Course',
      progressPct: typeof entry.progressPct === 'number' ? entry.progressPct : undefined,
      score: typeof entry.score === 'number' ? entry.score : undefined,
      createdAt: toIso(entry.createdAt) || new Date().toISOString(),
    }));

    return NextResponse.json({
      ok: true,
      user: {
        id: user._id.toString(),
        name: typeof user.fullName === 'string' ? user.fullName : 'User',
        email: typeof user.email === 'string' ? user.email : '-',
      },
      assignments,
      timeline,
    });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to load user assignment history.',
        details: process.env.NODE_ENV === 'development' ? details : undefined,
      },
      { status: 500 }
    );
  }
}
