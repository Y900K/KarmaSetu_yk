import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getMongoDb } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/db/collections';
import { resolveSessionUser } from '@/lib/auth/session';

type UpdateAlertBody = {
  status?: 'dismissed' | 'resolved';
};

const ALLOWED_STATUS = new Set(['dismissed', 'resolved']);

export async function PATCH(request: Request, context: { params: Promise<{ alertId: string }> }) {
  try {
    const db = await getMongoDb();
    const session = await resolveSessionUser(db, request);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ ok: false, message: 'Admin access denied.' }, { status: 403 });
    }

    const { alertId } = await context.params;
    if (!ObjectId.isValid(alertId)) {
      return NextResponse.json({ ok: false, message: 'Invalid alert id.' }, { status: 400 });
    }

    const body = (await request.json().catch(() => ({}))) as UpdateAlertBody;
    const status = typeof body.status === 'string' && ALLOWED_STATUS.has(body.status)
      ? body.status
      : undefined;

    if (!status) {
      return NextResponse.json({ ok: false, message: 'Invalid status.' }, { status: 400 });
    }

    const result = await db.collection(COLLECTIONS.adminNotifications).updateOne(
      { _id: new ObjectId(alertId) },
      { $set: { status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ ok: false, message: 'Alert not found.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: 'Alert updated.' });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to update alert.',
        details: process.env.NODE_ENV === 'development' ? details : undefined,
      },
      { status: 500 }
    );
  }
}
