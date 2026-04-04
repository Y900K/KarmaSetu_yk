import { NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/db/collections';
import { resolveSessionUser } from '@/lib/auth/session';

export async function GET(request: Request) {
  try {
    const db = await getMongoDb();
    const session = await resolveSessionUser(db, request);

    if (!session) {
      return NextResponse.json({ ok: false, message: 'Not authenticated.' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ ok: false, message: 'Admin access denied.' }, { status: 403 });
    }

    const url = new URL(request.url);
    const parsedLimit = Number(url.searchParams.get('limit') || '100');
    const limit = Number.isFinite(parsedLimit) ? Math.max(1, Math.min(500, Math.floor(parsedLimit))) : 100;

    const feedbackCollection = db.collection(COLLECTIONS.traineeFeedback);
    const [rows, groupedStats] = await Promise.all([
      feedbackCollection.find({}).sort({ createdAt: -1 }).limit(limit).toArray(),
      feedbackCollection
        .aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ])
        .toArray(),
    ]);

    const statsMap = new Map<string, number>();
    for (const row of groupedStats) {
      if (typeof row._id === 'string' && typeof row.count === 'number') {
        statsMap.set(row._id, row.count);
      }
    }
    const openCount = statsMap.get('open') || 0;
    const reviewingCount = statsMap.get('reviewing') || 0;
    const resolvedCount = statsMap.get('resolved') || 0;

    return NextResponse.json({
      ok: true,
      count: rows.length,
      stats: {
        open: openCount,
        reviewing: reviewingCount,
        resolved: resolvedCount,
        total: openCount + reviewingCount + resolvedCount,
      },
      feedback: rows.map((row) => ({
        id: row._id.toString(),
        userName: typeof row.userName === 'string' ? row.userName : 'Trainee',
        userEmail: typeof row.userEmail === 'string' ? row.userEmail : undefined,
        category: typeof row.category === 'string' ? row.category : 'general',
        message: typeof row.message === 'string' ? row.message : '',
        rating: typeof row.rating === 'number' ? row.rating : undefined,
        status: typeof row.status === 'string' ? row.status : 'open',
        adminNote: typeof row.adminNote === 'string' ? row.adminNote : undefined,
        createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : new Date().toISOString(),
      })),
    });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to load feedback list.',
        details: process.env.NODE_ENV === 'development' ? details : undefined,
      },
      { status: 500 }
    );
  }
}
