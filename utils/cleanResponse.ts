/**
 * Cleans AI response text by removing markdown characters and formatting
 * to ensure proper display and TTS rendering without special symbols.
 */
function looksLikeMojibake(text: string): boolean {
  return /(?:\u00F0\u0178|\u00E2\u0161|\u00E0\u00A4|\u00E0\u00A5|\u00C3.|\u00C2.|\u00E2\u20AC)/.test(text);
}

function repairMojibake(text: string): string {
  if (!text || !looksLikeMojibake(text)) return text;

  const bytes: number[] = [];
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (code > 255) {
      return text;
    }
    bytes.push(code);
  }

  try {
    const repaired = new TextDecoder('utf-8', { fatal: false }).decode(Uint8Array.from(bytes));
    return repaired.includes('\uFFFD') ? text : repaired;
  } catch {
    return text;
  }
}

export function cleanResponse(text: string): string {
  if (!text || typeof text !== 'string') return '';

  const repairedText = repairMojibake(text);

  return (
    repairedText
      .replace(/\r\n/g, '\n')
      // Remove model reasoning blocks that should never reach UI/TTS.
      .replace(/<think>[\s\S]*?<\/think>/gi, ' ')
      .replace(/<analysis>[\s\S]*?<\/analysis>/gi, ' ')
      .replace(/<thinking>[\s\S]*?<\/thinking>/gi, ' ')
      .replace(/<\/?(think|analysis|thinking)>/gi, ' ')
      .replace(/^\s*(thinking|reasoning)\s*:\s*$/gim, '')
      .replace(/^\s*(thinking|reasoning)\s*:/gim, '')
      .replace(/#{1,6}\s*/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/(?:^|\s+)-\s+/g, '\n\u2022 ')
      .replace(/`{1,3}/g, '')
      .replace(/__/g, '')
      // Put every numbered point on a new line for readability.
      .replace(/\s*(\d+)\.\s+/g, '\n$1. ')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]{2,}/g, ' ')
      .trim()
  );
}

/**
 * Prepare text specifically for TTS engines by removing punctuation symbols
 * that may be read literally and normalizing whitespace.
 */
export function sanitizeForTTS(text: string): string {
  const normalized = cleanResponse(text)
    .replace(/[.,;:'"!?()[\]{}<>\\/|`~@#$%^&*=+_\-]/g, ' ')
    .replace(/[\u2022\u0964\u0965]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return normalized;
}
