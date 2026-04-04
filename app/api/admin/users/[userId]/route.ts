import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { COLLECTIONS } from '@/lib/db/collections';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export async function DELETE(request: Request, { params }: { params: Promise<{ userId: string }> }) {
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

    const _id = new ObjectId(userId);

    const deleteResult = await db.collection(COLLECTIONS.users).deleteOne({ _id });
    if (!deleteResult.deletedCount) {
      return NextResponse.json({ ok: false, message: 'User not found.' }, { status: 404 });
    }

    await Promise.all([
      db.collection(COLLECTIONS.sessions).deleteMany({ userId }),
      db.collection(COLLECTIONS.enrollments).deleteMany({ userId }),
      db.collection(COLLECTIONS.certificates).deleteMany({ userId }),
    ]);

    return NextResponse.json({ ok: true, message: 'User deleted.' });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to delete user.',
        details: process.env.NODE_ENV === 'development' ? details : undefined,
      },
      { status: 500 }
    );
  }
}
