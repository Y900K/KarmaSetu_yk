import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { COLLECTIONS } from '@/lib/db/collections';
import { requireSecureAdminMutation } from '@/lib/security/requireSecureAdminMutation';
import { logSystemEvent } from '@/lib/utils/logger';

export async function POST(request: Request) {
  try {
    const admin = await requireSecureAdminMutation(request, 'admin_course_bulk_delete');
    if (!admin.ok) {
      return admin.response;
    }

    const { db, session } = admin;
    const body = await request.json().catch(() => ({}));
    const { courseIds } = body;

    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json({ ok: false, message: 'No course IDs provided.' }, { status: 400 });
    }

    const validObjectIds = courseIds
      .filter((id) => typeof id === 'string' && ObjectId.isValid(id))
      .map((id) => new ObjectId(id));

    if (validObjectIds.length === 0) {
      return NextResponse.json({ ok: false, message: 'Invalid course IDs provided.' }, { status: 400 });
    }

    const now = new Date();

    // 1. Mark courses as deleted
    const courseResult = await db.collection(COLLECTIONS.courses).updateMany(
      { _id: { $in: validObjectIds } },
      {
        $set: {
          isDeleted: true,
          isPublished: false,
          deletedAt: now,
          updatedAt: now,
        },
      }
    );

    // 2. Expire all associated enrollments
    // Enrollment courseId is stored as a string in most places in this codebase, but we check both if unsure.
    // Based on [courseId]/route.ts, it uses courseId string.
    const stringIds = validObjectIds.map(id => id.toString());
    await db.collection(COLLECTIONS.enrollments).updateMany(
      { courseId: { $in: stringIds } },
      {
        $set: {
          status: 'expired',
          updatedAt: now,
        },
      }
    );

    // 3. Insert audit entries
    const auditEntries = stringIds.map(id => ({
      courseId: id,
      action: 'course_deleted_bulk',
      source: 'admin_api',
      createdAt: now,
      metadata: {
        endpoint: '/api/admin/courses/bulk-delete',
        actorAdminId: session.user._id.toString(),
      },
    }));
    await db.collection(COLLECTIONS.enrollmentAudit).insertMany(auditEntries);

    // 4. Log system event
    await logSystemEvent(
      'INFO',
      'admin_course_bulk_delete',
      'Bulk courses deleted by admin.',
      { 
        actorAdminId: session.user._id.toString(), 
        count: courseResult.modifiedCount,
        ids: stringIds 
      },
      session.user._id.toString()
    );

    return NextResponse.json({ 
      ok: true, 
      message: `${courseResult.modifiedCount} course(s) deleted successfully.`,
      count: courseResult.modifiedCount 
    });
  } catch (error) {
    await logSystemEvent(
      'ERROR',
      'admin_course_bulk_delete',
      'Admin bulk course deletion route failed.',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );

    return NextResponse.json(
      { ok: false, message: 'Failed to perform bulk deletion.' },
      { status: 500 }
    );
  }
}
