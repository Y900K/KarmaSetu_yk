import { NextResponse } from 'next/server';
import { COLLECTIONS } from '@/lib/db/collections';
import { requireTrainee } from '@/lib/auth/requireTrainee';

type FeedbackBody = {
  category?: 'suggestion' | 'issue' | 'feature' | 'general';
  message?: string;
  rating?: number;
};

const ALLOWED_CATEGORIES = new Set(['suggestion', 'issue', 'feature', 'general']);

export async function POST(request: Request) {
  try {
    const trainee = await requireTrainee(request);
    if (!trainee.ok) {
      return trainee.response;
    }

    const { db, session } = trainee;

    const body = (await request.json().catch(() => ({}))) as FeedbackBody;
    const category = typeof body.category === 'string' && ALLOWED_CATEGORIES.has(body.category)
      ? body.category
      : 'general';
    const message = body.message?.trim();
    const rating = typeof body.rating === 'number' ? Math.max(1, Math.min(5, Math.floor(body.rating))) : undefined;

    if (!message || message.length < 10) {
      return NextResponse.json(
        { ok: false, message: 'Feedback message must be at least 10 characters.' },
        { status: 400 }
      );
    }

    const now = new Date();
    const result = await db.collection(COLLECTIONS.traineeFeedback).insertOne({
      userId: session.user._id.toString(),
      userName: typeof session.user.fullName === 'string' ? session.user.fullName : 'Trainee',
      userEmail: typeof session.user.email === 'string' ? session.user.email : undefined,
      category,
      message,
      rating,
      status: 'open',
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ ok: true, id: result.insertedId.toString(), message: 'Feedback submitted.' });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to submit feedback.',
        details: process.env.NODE_ENV === 'development' ? details : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const trainee = await requireTrainee(request);
    if (!trainee.ok) {
      return trainee.response;
    }

    const { db, session } = trainee;

    const userId = session.user._id;
    const rows = await db
      .collection(COLLECTIONS.traineeFeedback)
      .find({ userId: userId.toString() })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    return NextResponse.json({
      ok: true,
      feedback: rows.map((row) => ({
        id: row._id.toString(),
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
        message: 'Failed to load feedback.',
        details: process.env.NODE_ENV === 'development' ? details : undefined,
      },
      { status: 500 }
    );
  }
}
