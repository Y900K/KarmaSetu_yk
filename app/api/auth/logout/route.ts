import { NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/db/collections';
import { clearSessionCookie, getSessionTokenFromRequest } from '@/lib/auth/session';
import { buildTokenFingerprint, verifySecret } from '@/lib/auth/security';

export async function POST(request: Request) {
  try {
    const token = getSessionTokenFromRequest(request);
    const response = NextResponse.json({ ok: true, message: 'Logged out.' });
    clearSessionCookie(response);

    if (!token) {
      return response;
    }

    const db = await getMongoDb();
    const sessionsCollection = db.collection(COLLECTIONS.sessions);
    const tokenFingerprint = buildTokenFingerprint(token);

    const activeSession = await sessionsCollection.findOne({ tokenFingerprint });

    if (activeSession) {
      await sessionsCollection.deleteOne({ _id: activeSession._id });
      return response;
    }

    const sessions = await sessionsCollection
      .find({ expiresAt: { $gt: new Date() } })
      .project({ _id: 1, tokenHash: 1 })
      .toArray();

    const legacySession = sessions.find(
      (session) => typeof session.tokenHash === 'string' && verifySecret(token, session.tokenHash)
    );

    if (legacySession) {
      await sessionsCollection.deleteOne({ _id: legacySession._id });
    }

    return response;
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to logout.',
        details: process.env.NODE_ENV === 'development' ? details : undefined,
      },
      { status: 500 }
    );
  }
}
