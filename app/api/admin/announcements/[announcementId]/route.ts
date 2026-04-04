import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getMongoDb } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/db/collections';
import { resolveSessionUser } from '@/lib/auth/session';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ announcementId: string }> }
) {
  try {
    const db = await getMongoDb();
    const session = await resolveSessionUser(db, request);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ ok: false, message: 'Admin access denied.' }, { status: 403 });
    }

    const { announcementId } = await context.params;
    if (!ObjectId.isValid(announcementId)) {
      return NextResponse.json({ ok: false, message: 'Invalid announcement id.' }, { status: 400 });
    }

    const result = await db.collection(COLLECTIONS.adminAnnouncements).updateOne(
      { _id: new ObjectId(announcementId) },
      {
        $set: {
          status: 'archived',
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ ok: false, message: 'Announcement not found.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: 'Announcement archived.' });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to archive announcement.',
        details: process.env.NODE_ENV === 'development' ? details : undefined,
      },
      { status: 500 }
    );
  }
}
