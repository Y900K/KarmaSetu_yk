import { NextResponse } from 'next/server';
import { requireTrainee } from '@/lib/auth/requireTrainee';

const BASE_URL = 'https://api.sarvam.ai';

async function callSarvamChat(payload: object, apiKey: string) {
  return fetch(`${BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'API-Subscription-Key': apiKey,
    },
    body: JSON.stringify(payload),
  });
}

function stripReasoningBlocks(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, ' ')
    .replace(/<analysis>[\s\S]*?<\/analysis>/gi, ' ')
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, ' ')
    .replace(/<\/?(think|analysis|thinking)>/gi, ' ')
    .trim();
}

function extractJSON(text: string): string {
  try {
    // Attempt absolute raw parsing first
    return text.trim();
  } catch {
    // ignore
  }
  
  // Remove markdown blocks
  const cleaned = text.replace(/```[A-Za-z]*/g, '').replace(/```/g, '').trim();
  
  // Find the exact bounds of the JSON array
  const startIdx = cleaned.indexOf('[');
  const endIdx = cleaned.lastIndexOf(']');
  
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    return cleaned.substring(startIdx, endIdx + 1);
  }
  
  return cleaned;
}

export async function POST(request: Request) {
  try {
    const trainee = await requireTrainee(request);
    if (!trainee.ok) {
      return trainee.response;
    }

    const { topic, language, count = 10 } = await request.json();
    const apiKey = process.env.SARVAM_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'SARVAM_API_KEY is missing. Please check your .env file.' },
        { status: 500 }
      );
    }

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json(
        { error: 'A valid topic is required to generate a quiz.' },
        { status: 400 }
      );
    }

    const isHindi = language === 'HINGLISH';
    
    const linguisticConstraint = isHindi 
      ? "\nCRITICAL LINGUISTIC INSTRUCTION: You MUST generate the questions, options, and explanations using a natural mix of Hindi (written in Devanagari script) and English (written in Roman script). Essential industrial terms, safety gear (e.g., PPE, Fire Extinguisher, Gloves, Helmets), acronyms, and technical jargons MUST remain in English. Example style: 'PPE (Personal Protective Equipment) à¤µà¥‹ safety gear à¤¹à¥‹à¤¤à¤¾ à¤¹à¥ˆ à¤œà¥‹ chemical plants à¤®à¥‡à¤‚ à¤•à¤¾à¤® à¤•à¤°à¤¤à¥‡ à¤µà¥˜à¥à¤¤ workers à¤•à¥‹ hazards à¤¸à¥‡ à¤¬à¤šà¤¾à¤¤à¤¾ à¤¹à¥ˆà¥¤'"
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

    const response = await callSarvamChat(
      {
        model: 'sarvam-m',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1, // extremely low temp for structured output adherence
        max_tokens: 3000,
      },
      apiKey
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error(`[Practice Quiz API] Error from Sarvam AI:`, errData);
      return NextResponse.json(
        { error: 'Failed to generate quiz from AI provider.' },
        { status: response.status }
      );
    }

    const data = await response.json();
    let content = data?.choices?.[0]?.message?.content || '[]';
    
    // Strip LLM internal monologues first
    content = stripReasoningBlocks(content);
    
    // Clean and parse JSON
    content = extractJSON(content);
    
    try {
      const parsedQuiz = JSON.parse(content);
      
      // Basic validation
      if (!Array.isArray(parsedQuiz) || parsedQuiz.length === 0) {
        throw new Error('AI returned an invalid quiz structure.');
      }
      
      return NextResponse.json({ ok: true, quiz: parsedQuiz });
    } catch (parseError) {
      console.error(`[Practice Quiz API] JSON Parse Error:`, parseError);
      console.error(`[Practice Quiz API] Raw AI Content:`, content);
      return NextResponse.json(
        { error: 'The AI generated an invalid quiz format. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal Server Error', details },
      { status: 500 }
    );
  }
}

