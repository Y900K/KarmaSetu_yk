import { NextResponse } from 'next/server';
import type { Db } from 'mongodb';
import { getMongoDb } from '@/lib/mongodb';
import { resolveSessionUser } from '@/lib/auth/session';

type TraineeSession = NonNullable<Awaited<ReturnType<typeof resolveSessionUser>>>;

export type TraineeGuardResult =
  | { ok: true; db: Db; session: TraineeSession }
  | { ok: false; response: NextResponse };

export async function requireTrainee(request: Request): Promise<TraineeGuardResult> {
  const db = await getMongoDb();
  const session = await resolveSessionUser(db, request);

  if (!session || session.user.role !== 'trainee') {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, message: 'Trainee access denied.' }, { status: 403 }),
    };
  }

  return { ok: true, db, session };
}
