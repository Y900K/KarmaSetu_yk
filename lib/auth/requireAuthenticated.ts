import { NextResponse } from 'next/server';
import type { Db } from 'mongodb';
import { getMongoDb } from '@/lib/mongodb';
import { resolveSessionUser } from '@/lib/auth/session';

type AuthenticatedSession = NonNullable<Awaited<ReturnType<typeof resolveSessionUser>>>;

export type AuthenticatedGuardResult =
  | { ok: true; db: Db; session: AuthenticatedSession }
  | { ok: false; response: NextResponse };

export async function requireAuthenticated(request: Request): Promise<AuthenticatedGuardResult> {
  const db = await getMongoDb();
  const session = await resolveSessionUser(db, request);

  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, message: 'Authentication required.' }, { status: 401 }),
    };
  }

  return { ok: true, db, session };
}
