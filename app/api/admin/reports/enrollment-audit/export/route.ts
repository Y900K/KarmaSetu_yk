import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { COLLECTIONS } from '@/lib/db/collections';
import { requireAdmin } from '@/lib/auth/requireAdmin';

function csvEscape(value: unknown): string {
  const text = value == null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(request);
    if (!admin.ok) {
      return admin.response;
    }

    const { db } = admin;

    const url = new URL(request.url);
    const parsedLimit = Number(url.searchParams.get('limit') || '1000');
    const limit = Number.isFinite(parsedLimit) ? Math.max(1, Math.min(5000, Math.floor(parsedLimit))) : 1000;

    const rows = await db
      .collection(COLLECTIONS.enrollmentAudit)
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    const userIds = Array.from(
      new Set(
        rows
          .map((entry) => (typeof entry.userId === 'string' && ObjectId.isValid(entry.userId) ? entry.userId : null))
          .filter((value): value is string => Boolean(value))
      )
    );
    const courseIds = Array.from(
      new Set(
        rows
          .map((entry) => (typeof entry.courseId === 'string' && ObjectId.isValid(entry.courseId) ? entry.courseId : null))
          .filter((value): value is string => Boolean(value))
      )
    );

    const [users, courses] = await Promise.all([
      userIds.length
        ? db
            .collection(COLLECTIONS.users)
            .find({ _id: { $in: userIds.map((id) => new ObjectId(id)) } })
            .project({ fullName: 1 })
            .toArray()
        : [],
      courseIds.length
        ? db
            .collection(COLLECTIONS.courses)
            .find({ _id: { $in: courseIds.map((id) => new ObjectId(id)) } })
            .project({ title: 1 })
            .toArray()
        : [],
    ]);

    const userMap = new Map(users.map((user) => [user._id.toString(), String(user.fullName || 'Unknown User')]));
    const courseMap = new Map(courses.map((course) => [course._id.toString(), String(course.title || 'Unknown Course')]));

    const header = [
      'createdAt',
      'action',
      'source',
      'userId',
      'userName',
      'courseId',
      'courseTitle',
      'progressPct',
      'score',
      'metadata',
    ];

    const dataLines = rows.map((entry) => {
      const createdAt = entry.createdAt instanceof Date ? entry.createdAt.toISOString() : '';
      const action = typeof entry.action === 'string' ? entry.action : '';
      const source = typeof entry.source === 'string' ? entry.source : '';
      const userId = typeof entry.userId === 'string' ? entry.userId : '';
      const userName = userId ? userMap.get(userId) || 'Unknown User' : 'Unknown User';
      const courseId = typeof entry.courseId === 'string' ? entry.courseId : '';
      const courseTitle = courseId ? courseMap.get(courseId) || 'Unknown Course' : 'Unknown Course';
      const progressPct = typeof entry.progressPct === 'number' ? entry.progressPct : '';
      const score = typeof entry.score === 'number' ? entry.score : '';
      const metadata = entry.metadata ? JSON.stringify(entry.metadata) : '';

      return [createdAt, action, source, userId, userName, courseId, courseTitle, progressPct, score, metadata]
        .map(csvEscape)
        .join(',');
    });

    const csv = [header.map(csvEscape).join(','), ...dataLines].join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="enrollment-audit-${Date.now()}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to export enrollment audit CSV.',
        details: process.env.NODE_ENV === 'development' ? details : undefined,
      },
      { status: 500 }
    );
  }
}
