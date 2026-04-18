import { NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { resolveSessionUser } from '@/lib/auth/session';
import { getUnreadNotifications, markNotificationAsRead } from '@/lib/notifications';

export async function GET(request: Request) {
  try {
    const db = await getMongoDb();
    const session = await resolveSessionUser(db, request);

    if (!session) {
      return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const role = session.user.role === 'admin' ? 'admin' : 'trainee';

    const notifications = await getUnreadNotifications(db, session.user._id.toString(), role, limit);

    return NextResponse.json({ ok: true, notifications });
  } catch (error) {
    console.error('Notifications GET error:', error);
    return NextResponse.json({ ok: false, message: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const db = await getMongoDb();
    const session = await resolveSessionUser(db, request);

    if (!session) {
      return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { notificationId, all } = body;

    if (all) {
      const role = session.user.role === 'admin' ? 'admin' : 'trainee';
      const { COLLECTIONS } = await import('@/lib/db/collections');
      await db.collection(COLLECTIONS.adminNotifications).updateMany(
        { userId: session.user._id.toString(), role, status: 'open' },
        { $set: { status: 'read', updatedAt: new Date() } }
      );
      return NextResponse.json({ ok: true });
    }

    if (!notificationId) {
      return NextResponse.json({ ok: false, message: 'notificationId is required' }, { status: 400 });
    }

    await markNotificationAsRead(db, notificationId, session.user._id.toString());

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Notifications PATCH error:', error);
    return NextResponse.json({ ok: false, message: 'Failed to update notification' }, { status: 500 });
  }
}
