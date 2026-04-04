import { NextResponse } from 'next/server';
import { generateAdminCourseQuiz } from '@/lib/server/adminCourseAI';
import { requireAdmin } from '@/lib/auth/requireAdmin';

function detectLanguageMode(topic: string): 'english' | 'hinglish' {
  if (/[\u0900-\u097F]/.test(topic)) {
    return 'hinglish';
  }

  if (/\b(hinglish|hindi|हिंदी|हिन्दी)\b/i.test(topic)) {
    return 'hinglish';
  }

  return 'english';
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(request);
    if (!admin.ok) {
      return admin.response;
    }

    const body = (await request.json().catch(() => ({}))) as {
      topic?: string;
      count?: number;
      language?: 'english' | 'hinglish' | 'auto';
    };
    const topic = typeof body.topic === 'string' ? body.topic.trim() : '';
    const count = typeof body.count === 'number' ? Math.min(10, Math.max(1, Math.round(body.count))) : 10;
    const requestedLanguage = body.language;
    const languageMode =
      requestedLanguage === 'english' || requestedLanguage === 'hinglish'
        ? requestedLanguage
        : detectLanguageMode(topic);
    const apiKey = process.env.SARVAM_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ ok: false, message: 'SARVAM_API_KEY is missing.' }, { status: 500 });
    }

    if (!topic) {
      return NextResponse.json({ ok: false, message: 'A valid topic is required.' }, { status: 400 });
    }

    const questions = await generateAdminCourseQuiz(topic, apiKey, count, languageMode);
    return NextResponse.json({ ok: true, questions });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to generate the admin course quiz.',
        details: process.env.NODE_ENV === 'development' ? details : undefined,
      },
      { status: 500 }
    );
  }
}
