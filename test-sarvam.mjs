const apiKey = process.env.SARVAM_API_KEY || "dummy"; // I'll need to pass this or read it from .env
console.log("Starting Sarvam test...");

const systemPrompt = `You are a strict technical quiz generator. Your only purpose is to output valid JSON.
Generate exactly 5 multiple choice questions on the requested safety topic.
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

async function test() {
  const response = await fetch('https://api.sarvam.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'API-Subscription-Key': apiKey,
    },
    body: JSON.stringify({
      model: 'sarvam-m',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate a 5-question JSON quiz about: Fire Safety. Return ONLY JSON.' },
      ],
      temperature: 0.1,
      max_tokens: 1500,
    }),
  });
  
  const text = await response.text();
  console.log("Raw Response:");
  console.log(text);
}

test();
