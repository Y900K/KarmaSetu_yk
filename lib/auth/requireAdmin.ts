import { NextResponse } from 'next/server';
import type { Db } from 'mongodb';
import { getMongoDb } from '@/lib/mongodb';
import { resolveSessionUser } from '@/lib/auth/session';

type AdminSession = NonNullable<Awaited<ReturnType<typeof resolveSessionUser>>>;

export type AdminGuardResult =
  | { ok: true; db: Db; session: AdminSession }
  | { ok: false; response: NextResponse };

export async function requireAdmin(request: Request): Promise<AdminGuardResult> {
  const db = await getMongoDb();
  const session = await resolveSessionUser(db, request);

  if (!session || session.user.role !== 'admin') {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, message: 'Admin access denied.' }, { status: 403 }),
    };
  }

  return { ok: true, db, session };
}
