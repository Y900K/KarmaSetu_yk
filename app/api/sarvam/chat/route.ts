import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { cleanResponse } from '@/utils/cleanResponse';
import { buildBuddyFallbackResponse } from '@/utils/buddyFallback';
import { getMongoDb } from '@/lib/mongodb';
import { resolveSessionUser } from '@/lib/auth/session';
import { checkRequestRateLimit } from '@/lib/security/requestRateLimit';
import { callAI } from '@/lib/server/aiGateway';

function needsDetailedResponse(text: string): boolean {
  const q = text.toLowerCase();
  return [
    'explain',
    'detailed',
    'detail',
    'step',
    'steps',
    'procedure',
    'why',
    'how',
    'compare',
    'difference',
    'protocol',
    'root cause',
    'checklist',
    'incident',
    'kaise',
    'kyon',
    'samjhao',
    'samjhaiye',
    'prakriya',
  ].some((k) => q.includes(k));
}

function enforceWordCap(text: string, cap: number): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return normalized;
  const words = normalized.split(' ');
  if (words.length <= cap) return normalized;
  return `${words.slice(0, cap).join(' ')}...\n\nAsk me for more details on any specific step.`;
}

function normalizeConversation(messages: Array<{ role?: string; content?: string }>): Array<{ role: 'user' | 'assistant'; content: string }> {
  const normalized = (messages || [])
    .map((m) => ({
      role: m?.role === 'assistant' || m?.role === 'bot' ? 'assistant' : m?.role === 'user' ? 'user' : null,
      content: typeof m?.content === 'string' ? m.content.trim() : '',
    }))
    .filter((m): m is { role: 'user' | 'assistant'; content: string } => !!m.role && !!m.content);

  // Sarvam requires strictly alternating roles, starting with user.
  while (normalized.length > 0 && normalized[0].role !== 'user') {
    normalized.shift();
  }

  // Merge consecutive messages of the same role
  const alternating: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  for (const msg of normalized) {
    if (alternating.length > 0 && alternating[alternating.length - 1].role === msg.role) {
      alternating[alternating.length - 1].content += `\n\n${msg.content}`;
    } else {
      alternating.push(msg);
    }
  }

  return alternating;
}

function buildSystemPrompt(isHinglish: boolean, isVoiceInitiated: boolean, isQuizActive: boolean = false): string {
  const basePrompt = `You are Buddy AI, a specialized assistant for:
- Chemical manufacturing industry protocols and practices
- Apprenticeship training and vocational education
- Health and safety compliance (HSE standards)
- General plant safety and chemical manufacturing processes
- GUIDANCE ONLY during active assessments (assessments are currently ${isQuizActive ? 'ACTIVE' : 'INACTIVE'})

IDENTITY & TONE:
- You are a practical, friendly safety mentor. Be direct and professional. Do not apologize excessively.
- If asked something outside these topics (e.g., cricket, movies, cooking, general trivia), respond with:
  "I'm Buddy, your assistant for chemical manufacturing, health & safety, and plant training. I'm not able to help with that topic."`;

  const languageRules = isHinglish
    ? `LANGUAGE MODE: HINGLISH (Hindi-English mix for Indian conversation)
- Always respond in Hinglish when user prefers it
- Prefer Hindi words in Devanagari script and keep technical or product terms in English
- Use natural mixed-script Hinglish such as "PPE पहनें" or "alarm तुरंत raise करें"
- Do not transliterate English technical terms into Devanagari unless the user explicitly asks for pure Hindi
- Pick ONE form per word, never duplicate
- Keep it conversational and easy to understand for Indian learners`
    : `LANGUAGE MODE: ENGLISH
- Respond entirely in clear English
- Use simple terms where possible
- Explain technical terms when needed`;

  const voiceNotes = isVoiceInitiated
    ? `VOICE INPUT NOTES:
- User spoke this question, so transcript may have:
  - Minor speech recognition errors
  - Incomplete words or abbreviations
  - Ambient noise artifacts
- Intelligently infer the user's actual intent, correct obvious errors
- Answer what they most likely meant to ask`
    : '';

  const proctoringRules = isQuizActive 
    ? `PROCTORING MODE ENABLED:
- The trainee is currently taking an assessment/quiz.
- DO NOT provide direct answers to clear multiple-choice or factual questions about safety protocols if they look like quiz questions.
- If the user asks "What is the correct answer?" or "is A correct?", politely refuse.
- Instead, give high-level reminders such as "Please focus on your assessment" or "Think about the safety principles we covered in the module."
- Do not provide explanations for specific question options while the quiz is active.`
    : '';

  return `${basePrompt}

${languageRules}

${voiceNotes}

${proctoringRules}

WORD LIMIT:
- Default: maximum 100 words. Be concise.
- EXCEPTION: For critical safety info, emergency procedures, chemical hazards, or step-by-step compliance, extend up to 200 words max.
- Never exceed 200 words under any circumstance.
- Keep responses clear, practical, and actionable.`;
}

function withCorrelation<T extends NextResponse>(response: T, correlationId: string): T {
  response.headers.set('x-correlation-id', correlationId);
  return response;
}

export async function POST(request: Request) {
  let latestUserMessage = '';
  let isHinglish = false;
  const correlationId = request.headers.get('x-correlation-id')?.trim() || randomUUID();

  try {
    const ip = (request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim() || 'unknown';
    let authUserId: string | null = null;
    try {
      const db = await getMongoDb();
      const session = await resolveSessionUser(db, request);
      if (session?.user?._id) {
        authUserId = session.user._id.toString();
      }
    } catch {
      // Guest user or DB initializing
    }

    const rateLimitKey = authUserId ? `sarvam_chat:user:${authUserId}` : `sarvam_chat:anon:${ip}`;
    const limiter = checkRequestRateLimit(rateLimitKey, {
      maxAttempts: authUserId ? 40 : 20,
      windowMs: 60_000,
      blockMs: 5 * 60_000,
    });

    if (limiter.blocked) {
      return withCorrelation(NextResponse.json(
        { error: 'Too many chat requests. Please wait a moment and try again.' },
        { status: 429 }
      ), correlationId);
    }


    const { messages, isQuizActive } = await request.json();

    // Extract language mode and voice intent from system message addendum
    let isVoiceInitiated = false;
    let filteredMessages = messages || [];

    if (filteredMessages.length > 0 && filteredMessages[0].role === 'system') {
      const sysMsg = filteredMessages[0].content || '';
      isHinglish = sysMsg.includes('[LANGUAGE_MODE: HINGLISH]');
      isVoiceInitiated = sysMsg.includes('[VOICE_INPUT]');
      filteredMessages = filteredMessages.slice(1);
    }

    filteredMessages = normalizeConversation(filteredMessages);

    latestUserMessage = [...filteredMessages]
      .reverse()
      .find((m: { role?: string; content?: string }) => m?.role === 'user')?.content ?? '';

    if (!latestUserMessage) {
      return withCorrelation(NextResponse.json(
        {
          choices: [
            {
              message: {
                content: 'Please ask your question, and I will help with safety and training guidance.'
              }
            }
          ]
        },
        { status: 200 }
      ), correlationId);
    }

    const wordCap = needsDetailedResponse(latestUserMessage) ? 200 : 100;
    const systemPrompt = buildSystemPrompt(isHinglish, isVoiceInitiated, !!isQuizActive);

    const gatewayResult = await callAI({
      task: 'buddy_chat',
      messages: [
        { role: 'system', content: systemPrompt },
        ...filteredMessages,
      ],
      temperature: 0.6,
      max_tokens: 500,
    });

    if (gatewayResult.provider === 'static_fallback') {
      return withCorrelation(NextResponse.json({
        choices: [
          {
            message: {
              content: cleanResponse(
                buildBuddyFallbackResponse(latestUserMessage, isHinglish ? 'hinglish' : 'english')
              ),
            },
          },
        ],
      }), correlationId);
    }

    const cleanedContent = enforceWordCap(cleanResponse(gatewayResult.content), wordCap);

    return withCorrelation(NextResponse.json({
      choices: [{ message: { content: cleanedContent } }],
      usage: { total_tokens: 0 },
      provider: gatewayResult.provider
    }), correlationId);

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Sarvam Chat Proxy] Fatal Error:', message);
    
    return withCorrelation(NextResponse.json({ error: 'Chat service failed.' }, { status: 500 }), correlationId);
  }
}
