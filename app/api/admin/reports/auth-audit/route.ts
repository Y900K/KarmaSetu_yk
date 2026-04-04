import { NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/db/collections';
import { resolveSessionUser } from '@/lib/auth/session';

type AuthAuditRow = {
  id: string;
  createdAt: string;
  action: string;
  identifier?: string;
  roleRequested: string;
  userId?: string;
  source: string;
  ip?: string;
  userAgent?: string;
  reason?: string;
};

export async function GET(request: Request) {
  try {
    const db = await getMongoDb();
    const session = await resolveSessionUser(db, request);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ ok: false, message: 'Admin access denied.' }, { status: 403 });
    }

    const url = new URL(request.url);
    const parsedLimit = Number(url.searchParams.get('limit') || '100');
    const limit = Number.isFinite(parsedLimit)
      ? Math.max(1, Math.min(500, Math.floor(parsedLimit)))
      : 100;

    const rows = await db
      .collection(COLLECTIONS.authAudit)
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    const payload: AuthAuditRow[] = rows.map((row) => ({
      id: row._id.toString(),
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : new Date().toISOString(),
      action: typeof row.action === 'string' ? row.action : 'unknown',
      identifier: typeof row.identifier === 'string' ? row.identifier : undefined,
      roleRequested: typeof row.roleRequested === 'string' ? row.roleRequested : 'trainee',
      userId: typeof row.userId === 'string' ? row.userId : undefined,
      source: typeof row.source === 'string' ? row.source : 'unknown',
      ip: typeof row.ip === 'string' ? row.ip : undefined,
      userAgent: typeof row.userAgent === 'string' ? row.userAgent : undefined,
      reason: typeof row.reason === 'string' ? row.reason : undefined,
    }));

    return NextResponse.json({ ok: true, count: payload.length, rows: payload });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to load auth audit report.',
        details: process.env.NODE_ENV === 'development' ? details : undefined,
      },
      { status: 500 }
    );
  }
}
