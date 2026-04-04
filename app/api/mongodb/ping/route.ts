import { NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { resolveSessionUser } from '@/lib/auth/session';

export async function GET(request: Request) {
  try {
    if (process.env.NODE_ENV === 'production') {
      const monitorKey = request.headers.get('x-setup-key');
      const hasValidSetupKey = Boolean(process.env.MONGODB_SETUP_KEY) && monitorKey === process.env.MONGODB_SETUP_KEY;

      if (!hasValidSetupKey) {
        const db = await getMongoDb();
        const session = await resolveSessionUser(db, request);
        if (!session || session.user.role !== 'admin') {
          return NextResponse.json({ ok: false, message: 'Admin access denied.' }, { status: 403 });
        }
      }
    }

    const db = await getMongoDb();
    await db.command({ ping: 1 });

    return NextResponse.json({ ok: true, message: 'MongoDB connection successful.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const details = process.env.NODE_ENV === 'development' ? message : undefined;

    return NextResponse.json(
      { ok: false, message: 'MongoDB connection failed.', details },
      { status: 500 }
    );
  }
}
