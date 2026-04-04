import { NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/db/collections';
import { resolveSessionUser } from '@/lib/auth/session';

type AdminAlertRow = {
  id: string;
  level: 'HIGH' | 'MEDIUM' | 'INFO';
  color: 'red' | 'yellow' | 'blue';
  icon: string;
  title: string;
  desc: string;
  action: string;
  createdAt: string;
};

function colorForLevel(level: 'HIGH' | 'MEDIUM' | 'INFO'): 'red' | 'yellow' | 'blue' {
  if (level === 'HIGH') {
    return 'red';
  }

  if (level === 'MEDIUM') {
    return 'yellow';
  }

  return 'blue';
}

function iconForCategory(category: string): string {
  if (category === 'security') {
    return '🛡️';
  }

  if (category === 'compliance') {
    return '⚠️';
  }

  return 'ℹ️';
}

export async function GET(request: Request) {
  try {
    const db = await getMongoDb();
    const session = await resolveSessionUser(db, request);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ ok: false, message: 'Admin access denied.' }, { status: 403 });
    }

    const url = new URL(request.url);
    const parsedLimit = Number(url.searchParams.get('limit') || '20');
    const limit = Number.isFinite(parsedLimit) ? Math.max(1, Math.min(100, Math.floor(parsedLimit))) : 20;

    const rows = await db
      .collection(COLLECTIONS.adminNotifications)
      .find({ status: 'open' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    const alerts: AdminAlertRow[] = rows.map((row) => {
      const level = (row.level === 'HIGH' || row.level === 'MEDIUM' || row.level === 'INFO') ? row.level : 'INFO';
      const category = typeof row.category === 'string' ? row.category : 'system';

      return {
        id: row._id.toString(),
        level,
        color: colorForLevel(level),
        icon: iconForCategory(category),
        title: typeof row.title === 'string' ? row.title : 'Notification',
        desc: typeof row.desc === 'string' ? row.desc : '',
        action: typeof row.action === 'string' ? row.action : 'Review',
        createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : new Date().toISOString(),
      };
    });

    return NextResponse.json({ ok: true, count: alerts.length, alerts });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to load admin alerts.',
        details: process.env.NODE_ENV === 'development' ? details : undefined,
      },
      { status: 500 }
    );
  }
}
