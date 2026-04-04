import { NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/db/collections';
import { resolveSessionUser } from '@/lib/auth/session';

export async function POST(request: Request) {
  try {
    const db = await getMongoDb();
    const session = await resolveSessionUser(db, request);
    
    // Simple admin check
    if (!session || session.user.role !== 'admin') {
       return NextResponse.json({ ok: false, message: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { courseIds } = body;

    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json({ ok: false, message: 'No courses provided to assign.' }, { status: 400 });
    }

    // Fetch all non-admin users to assign these courses to
    const trainees = await db.collection(COLLECTIONS.users).find({ role: { $ne: 'admin' } }).project({ _id: 1 }).toArray();
    
    if (trainees.length === 0) {
      return NextResponse.json({ ok: false, message: 'No trainees found in the system.' }, { status: 404 });
    }

    const now = new Date();
    const bulkOps = [];

    // For every selected course and every trainee, attempt to insert an assignment
    for (const courseId of courseIds) {
      for (const trainee of trainees) {
        bulkOps.push({
          updateOne: {
            filter: { userId: trainee._id.toString(), courseId: String(courseId) },
            update: {
              $setOnInsert: {
                userId: trainee._id.toString(),
                courseId: String(courseId),
                progressPct: 0,
                completedModuleIds: [],
                status: 'assigned',
                score: null,
                assignedAt: now,
                updatedAt: now,
              }
            },
            upsert: true
          }
        });
      }
    }

    if (bulkOps.length > 0) {
      await db.collection(COLLECTIONS.enrollments).bulkWrite(bulkOps, { ordered: false });
    }

    return NextResponse.json({ ok: true, message: `Courses successfully assigned to ${trainees.length} trainees.` });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { ok: false, message: 'Failed to assign courses.', details: process.env.NODE_ENV === 'development' ? details : undefined },
      { status: 500 }
    );
  }
}
