export type BuddyMessageLike = {
  role?: string;
  content?: string;
};

type BuddyMode = 'english' | 'hinglish';

const EMERGENCY_KEYWORDS = [
  'emergency',
  'fire',
  'alarm',
  'evacuate',
  'evacuation',
  'spill',
  'leak',
  'gas',
  'explosion',
  'blast',
  'injury',
  'first aid',
  'rescue',
  'chemical release',
];

export function getBuddyModeFromMessages(messages: BuddyMessageLike[]): BuddyMode {
  const systemMessage = messages.find((message) => message.role === 'system' && typeof message.content === 'string');
  const content = typeof systemMessage?.content === 'string' ? systemMessage.content : '';
  return content.includes('[LANGUAGE_MODE: HINGLISH]') ? 'hinglish' : 'english';
}

export function getLatestBuddyUserMessage(messages: BuddyMessageLike[]): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i];
    if (message.role === 'user' && typeof message.content === 'string' && message.content.trim()) {
      return message.content.trim();
    }
  }

  return '';
}

function isEmergencyPrompt(text: string): boolean {
  const normalized = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

export function buildBuddyFallbackResponse(userMessage: string, mode: BuddyMode): string {
  if (isEmergencyPrompt(userMessage)) {
    return mode === 'hinglish'
      ? 'Emergency में काम तुरंत रोक दें, alarm raise करें, supervisor या EHS team को inform करें, area को सिर्फ तब isolate करें जब safe हो, nearest emergency equipment use करें, और marked route से evacuate करें. All-clear मिलने से पहले वापस मत जाएं. Exact emergency बताओगे तो मैं सही SOP बता दूंगा.'
      : 'In an emergency, stop work immediately, raise the alarm, inform your supervisor or EHS team, isolate the area only if it is safe, use the nearest emergency equipment, and evacuate through the marked route. Do not re-enter until you receive the all-clear. Tell me the exact emergency and I can give the right SOP.';
  }

  return mode === 'hinglish'
    ? 'मेरा live AI connection अभी slow है, लेकिन मैं quick safety help दे सकता हूं. एक line में task, hazard, या chemical का नाम लिखो, जैसे: "chemical spill emergency procedure".'
    : 'My live AI connection is slow right now, but I can still help with quick safety guidance. Ask in one line with the task, hazard, or chemical name, for example: "chemical spill emergency procedure."';
}
