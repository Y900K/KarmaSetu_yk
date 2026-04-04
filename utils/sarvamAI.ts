/**
 * Sarvam AI Utility Wrapper
 * Proxies calls through internal secure API routes to protect API keys.
 */
import { buildBuddyFallbackResponse, getBuddyModeFromMessages, getLatestBuddyUserMessage } from '@/utils/buddyFallback';

const CHAT_TIMEOUT_MS = 45000;

export async function chatCompletion(messages: { role: string, content: string }[], isQuizActive?: boolean) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS);
  const buddyMode = getBuddyModeFromMessages(messages);
  const latestUserMessage = getLatestBuddyUserMessage(messages);

  try {
    const response = await fetch('/api/sarvam/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, isQuizActive }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const details = err?.details || err?.error;
      const detailMessage = typeof details === 'string' ? details : details?.message;
      const message = err?.message || err?.error || detailMessage || `Sarvam chat failed (${response.status})`;
      throw new Error(message);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content || typeof content !== 'string') {
      throw new Error('Invalid chat response format from server');
    }

    return content;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Sarvam Chat Timeout');
      return buildBuddyFallbackResponse(latestUserMessage, buddyMode);
    }

    console.warn('Sarvam Chat Error');

    const raw = String(error instanceof Error ? error.message : '').toLowerCase();
    if (raw.includes('timeout') || raw.includes('network') || raw.includes('fetch failed') || raw.includes('econnrefused') || raw.includes('etimedout')) {
      return buildBuddyFallbackResponse(latestUserMessage, buddyMode);
    }
    if (raw.includes('api key') || raw.includes('missing') || raw.includes('unauthorized') || raw.includes('forbidden')) {
      return "I'm unable to connect to the AI service right now due to a server configuration issue. Please contact support.";
    }
    if (raw.includes('first message must be from user') || raw.includes('invalid request')) {
      return "I hit a temporary conversation formatting issue. Please ask again, and I will respond properly.";
    }

    return buildBuddyFallbackResponse(latestUserMessage, buddyMode);
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function speechToText(audioBlob: Blob, language: 'hi-IN' | 'en-IN') {
  try {
    const formData = new FormData();
    formData.append('file', audioBlob);
    formData.append('model', 'saaras:v3');
    formData.append('language_code', language);

    const response = await fetch('/api/sarvam/asr', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || err.error || 'Sarvam ASR Proxy Error');
    }
    const data = await response.json();
    return typeof data?.transcript === 'string' && data.transcript.trim().length > 0
      ? data.transcript
      : null;
  } catch {
    console.warn('Sarvam ASR Error');
    return null;
  }
}

export async function textToSpeech(text: string, language: 'hi-IN' | 'en-IN') {
  try {
    const speaker = language === 'hi-IN' ? 'shubh' : 'amelia';

    const response = await fetch('/api/sarvam/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text,
        target_language_code: language,
        model: 'bulbul:v3',
        speaker,
        pace: 1.0,
        speech_sample_rate: 24000,
      }),
    });
 
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || err.error || 'Sarvam TTS Proxy Error');
    }
    
    const data = await response.json();
    return Array.isArray(data?.audios) && typeof data.audios[0] === 'string'
      ? data.audios[0]
      : null;
  } catch {
    console.warn('Sarvam TTS Error');
    return null;
  }
}
