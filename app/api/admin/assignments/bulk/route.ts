import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { COLLECTIONS } from '@/lib/db/collections';
import { requireAdmin } from '@/lib/auth/requireAdmin';

type BulkAssignmentBody = {
  userIds?: string[];
  courseId?: string;
};

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(request);
    if (!admin.ok) {
      return admin.response;
    }

    const { db } = admin;

    const body = (await request.json().catch(() => ({}))) as BulkAssignmentBody;
    const userIds = Array.isArray(body.userIds)
      ? body.userIds.filter((value): value is string => typeof value === 'string' && ObjectId.isValid(value))
      : [];
    const courseId = body.courseId?.trim();

    if (!courseId || !ObjectId.isValid(courseId)) {
      return NextResponse.json({ ok: false, message: 'Valid courseId is required.' }, { status: 400 });
    }

    if (!userIds.length) {
      return NextResponse.json({ ok: false, message: 'At least one valid userId is required.' }, { status: 400 });
    }

    const [course, users] = await Promise.all([
      db.collection(COLLECTIONS.courses).findOne({ _id: new ObjectId(courseId) }),
      db.collection(COLLECTIONS.users).find({ _id: { $in: userIds.map((id) => new ObjectId(id)) } }).toArray(),
    ]);

    if (!course) {
      return NextResponse.json({ ok: false, message: 'Course not found.' }, { status: 404 });
    }

    if (!users.length) {
      return NextResponse.json({ ok: false, message: 'No matching users found.' }, { status: 404 });
    }

    const now = new Date();

    await db.collection(COLLECTIONS.enrollments).bulkWrite(
      users.map((user) => ({
        updateOne: {
          filter: { userId: user._id.toString(), courseId },
          update: {
            $setOnInsert: {
              userId: user._id.toString(),
              courseId,
              progressPct: 0,
              completedModuleIds: [],
              assignedAt: now,
            },
            $set: {
              status: 'assigned',
              updatedAt: now,
            },
          },
          upsert: true,
        },
      })),
      { ordered: false }
    );

    await db.collection(COLLECTIONS.enrollmentAudit).insertMany(
      users.map((user) => ({
        userId: user._id.toString(),
        courseId,
        action: 'assigned_by_admin',
        source: 'admin_api',
        createdAt: now,
        metadata: {
          endpoint: '/api/admin/assignments/bulk',
        },
      }))
    );

    return NextResponse.json({ ok: true, message: 'Course assigned to selected users.', assignedCount: users.length });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        ok: false,
        message: 'Failed bulk assignment.',
        details: process.env.NODE_ENV === 'development' ? details : undefined,
      },
      { status: 500 }
    );
  }
}
