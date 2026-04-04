import { NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { clearSessionCookie, resolveSessionUser } from '@/lib/auth/session';

export async function GET(request: Request) {
  try {
    const db = await getMongoDb();
    const sessionData = await resolveSessionUser(db, request);

    if (!sessionData) {
      const response = NextResponse.json({ ok: false, message: 'Not authenticated.' }, { status: 401 });
      clearSessionCookie(response);
      return response;
    }

    const { user } = sessionData;
    return NextResponse.json({
      ok: true,
      user: {
        id: user._id.toString(),
        fullName: typeof user.fullName === 'string' ? user.fullName : 'User',
        email: typeof user.email === 'string' ? user.email : undefined,
        phone: typeof user.phone === 'string' ? user.phone : undefined,
        role: typeof user.role === 'string' ? user.role : 'trainee',
        department: typeof user.department === 'string' ? user.department : undefined,
        company: typeof user.company === 'string' ? user.company : undefined,
      },
    });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to read session.',
        details: process.env.NODE_ENV === 'development' ? details : undefined,
      },
      { status: 500 }
    );
  }
}
