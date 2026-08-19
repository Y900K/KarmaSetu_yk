import { NextResponse } from 'next/server';
import { requireTrainee } from '@/lib/auth/requireTrainee';
import { callAI, repairTruncatedJson, extractPotentialJson } from '@/lib/server/aiGateway';
import { generateDynamicQuizForTopic } from '@/lib/server/topicQuizEngine';

export async function POST(request: Request) {
  try {
    const trainee = await requireTrainee(request);
    if (!trainee.ok) {
      return trainee.response;
    }

    const { topic, language, count = 10 } = await request.json();

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json(
        { error: 'A valid topic is required to generate a quiz.' },
        { status: 400 }
      );
    }

    const isHindi = language === 'HINGLISH';
    
    const linguisticConstraint = isHindi 
      ? "\nCRITICAL LINGUISTIC INSTRUCTION: You MUST generate the questions, options, and explanations using a natural mix of Hindi (written in Devanagari script) and English (written in Roman script). Essential industrial terms, safety gear (e.g., PPE, Fire Extinguisher, Gloves, Helmets), acronyms, and technical jargons MUST remain in English. Example style: 'PPE (Personal Protective Equipment) वह safety gear होता है जो chemical plants में काम करते वक़्त workers को hazards से बचाता है।'"
      : "";

    const systemPrompt = `You are a strict technical quiz generator. Your only purpose is to output valid JSON.
Generate exactly ${count} multiple choice questions on the requested safety topic.${linguisticConstraint}
DO NOT output any conversational text, greetings, or explanations outside the JSON array.
DO NOT use markdown formatting (no backticks).
Return strictly this structure:
[
  {
    "q": "Insert question here?",
    "options": ["First option", "Second option", "Third option", "Fourth option"],
    "correct": 0,
    "explanation": "Why this is the correct answer in one sentence."
  }
]
Data Types: "correct" must be an integer between 0 and 3 index.`;

    console.log(`[Practice Quiz API] Generating quiz for topic: "${topic}" | Language: ${language || 'EN'}`);

    const userPrompt = isHindi 
      ? `Generate a ${count}-question JSON quiz about: ${topic}. Return ONLY JSON. Ensure all text inside the JSON follows the natural Hindi-English code-mixing instruction.`
      : `Generate a ${count}-question JSON quiz about: ${topic}. Return ONLY JSON.`;

    const gatewayResult = await callAI({
      task: 'practice_quiz',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 2048,
    });

    if (gatewayResult.provider === 'static_fallback') {
      const dynamicFallback = generateDynamicQuizForTopic(topic, isHindi ? 'HINGLISH' : 'EN', count);
      return NextResponse.json({ ok: true, quiz: dynamicFallback, isFallback: true });
    }

    try {
      const cleaned = extractPotentialJson(gatewayResult.content);
      const parsedQuiz = JSON.parse(repairTruncatedJson(cleaned));
      
      if (!Array.isArray(parsedQuiz) || parsedQuiz.length === 0) {
        throw new Error('AI returned an invalid quiz structure.');
      }
      
      return NextResponse.json({ ok: true, quiz: parsedQuiz, provider: gatewayResult.provider });
    } catch (error) {
      console.error(`[Practice Quiz API] AI parse error:`, error);
      const dynamicFallback = generateDynamicQuizForTopic(topic, isHindi ? 'HINGLISH' : 'EN', count);
      return NextResponse.json({ ok: true, quiz: dynamicFallback, isFallback: true });
    }
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal Server Error', details },
      { status: 500 }
    );
  }
}
