/**
 * AI Gateway — Centralized AI provider orchestrator for KarmaSetu.
 *
 * Provider priority:
 *   1. Sarvam AI  (PRIMARY — paid, optimized for Indic languages)
 *   2. OpenRouter  (FALLBACK — free models, activates when Sarvam fails)
 *   3. Static      (LAST RESORT — callers handle their own static fallbacks)
 *
 * This module is server-only. Never import in client components.
 */

import { checkCircuitBreaker, recordCircuitBreakerSuccess, recordCircuitBreakerFailure } from '@/lib/utils/circuitBreaker';
import { recordOpsMetric } from '@/lib/server/opsTelemetry';

// ─── Types ───────────────────────────────────────────────────────────────────

export type AITask = 'buddy_chat' | 'practice_quiz' | 'admin_quiz' | 'thumbnail_keywords';

export interface AIGatewayRequest {
  task: AITask;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  max_tokens?: number;
}

export interface AIGatewayResponse {
  content: string;
  provider: 'sarvam' | 'gemini' | 'openrouter' | 'static_fallback';
  model: string;
  isReasoningStripped?: boolean;
}

// ─── Provider Config ─────────────────────────────────────────────────────────

const SARVAM_BASE_URL = 'https://api.sarvam.ai';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

const OPENROUTER_FALLBACK_MODELS: string[] = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
  'google/gemini-2.0-flash-exp:free',
  'deepseek/deepseek-chat:free',
  'qwen/qwen-2.5-coder-32b-instruct:free',
];

/**
 * Strips various AI reasoning/thinking blocks from the output text.
 */
export function stripReasoningBlocks(text: string): string {
  if (typeof text !== 'string') return '';
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, ' ')
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, ' ')
    .replace(/<analysis>[\s\S]*?<\/analysis>/gi, ' ')
    .replace(/<\/?(think|thinking|analysis)>/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Attempts to extract a JSON array or object from a blob of text.
 */
export function extractPotentialJson(text: string): string {
  const cleaned = text.replace(/```[A-Za-z]*/g, '').replace(/```/g, '').trim();
  
  // Try array first
  const arrStart = cleaned.indexOf('[');
  if (arrStart !== -1) {
    const arrEnd = cleaned.lastIndexOf(']');
    if (arrEnd > arrStart) {
      return cleaned.substring(arrStart, arrEnd + 1);
    }
  }

  // Try object
  const objStart = cleaned.indexOf('{');
  if (objStart !== -1) {
    const objEnd = cleaned.lastIndexOf('}');
    if (objEnd > objStart) {
      return cleaned.substring(objStart, objEnd + 1);
    }
  }

  return cleaned;
}

/**
 * Attempts to repair JSON that has been truncated due to token limits.
 * It will try common closing tags, and if that fails, drops the last incomplete object.
 */
export function repairTruncatedJson(jsonStr: string): string {
  let cleaned = jsonStr.trim();
  try { JSON.parse(cleaned); return cleaned; } catch {
    // Falls through to repair logic
  }
  
  cleaned = cleaned.replace(/,\s*$/, '');
  
  const attempts = [
    cleaned + '}]',
    cleaned + ']}',
    cleaned + ']',
    cleaned + '"}',
    cleaned + '"}]',
  ];

  for (const attempt of attempts) {
    try {
      JSON.parse(attempt);
      return attempt;
    } catch {
      // Ignore each attempt failure silently
    }
  }

  const lastBrace = cleaned.lastIndexOf('{');
  if (lastBrace > 0) {
    const attempt = cleaned.substring(0, lastBrace).replace(/,\s*$/, '') + ']';
    try {
      JSON.parse(attempt);
      return attempt;
    } catch {
      // Final attempt failure
    }
  }

  return jsonStr;
}

const DEFAULT_TIMEOUT_MS = 20000;

// ─── Sarvam AI Caller ────────────────────────────────────────────────────────

async function callSarvam(
  messages: Array<{ role: string; content: string }>,
  temperature: number,
  maxTokens: number,
  apiKey: string,
): Promise<string> {
  // Enhanced retry logic with exponential-ish wait or just simple double-tap
  let lastError: unknown = null;
  
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      const response = await fetch(`${SARVAM_BASE_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'API-Subscription-Key': apiKey,
        },
        body: JSON.stringify({
          model: 'sarvam-30b',
          messages,
          temperature,
          max_tokens: Math.max(maxTokens, 2048),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('AUTH_FAILURE: Sarvam API Key is invalid or expired.');
        }
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.message || errData?.error || `Sarvam HTTP ${response.status}`);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;

      if (typeof content !== 'string') {
        throw new Error('Sarvam returned empty or invalid content structure');
      }

      return content;
    } catch (error) {
      lastError = error;
      if (attempt === 0) {
        console.warn(`[AI Gateway] Sarvam attempt 1 failed, retrying...`, error instanceof Error ? error.message : 'Unknown');
        // Small delay before retry
        await new Promise(r => setTimeout(r, 500));
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError || new Error('Sarvam failed after all attempts');
}

// ─── Gemini Caller ───────────────────────────────────────────────────────────

async function callGemini(
  messages: Array<{ role: string; content: string }>,
  temperature: number,
  maxTokens: number,
  apiKey: string,
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(`${GEMINI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gemini-2.0-flash',
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || errData?.message || `Gemini HTTP ${response.status}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content || typeof content !== 'string') {
      throw new Error('Gemini returned empty or invalid content');
    }

    return content;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── OpenRouter Caller ───────────────────────────────────────────────────────

async function callOpenRouter(
  messages: Array<{ role: string; content: string }>,
  temperature: number,
  maxTokens: number,
  model: string,
  apiKey: string,
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS + 5000);

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://karmasetu-lms.onrender.com',
        'X-Title': 'KarmaSetu Industrial Training Platform',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || errData?.message || `OpenRouter HTTP ${response.status}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content || typeof content !== 'string') {
      throw new Error('OpenRouter returned empty or invalid content');
    }

    return content;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── Main Gateway ────────────────────────────────────────────────────────────

// Map tasks to their exact telemetry metric keys
const OR_SUCCESS_METRICS: Record<AITask, Parameters<typeof recordOpsMetric>[0]> = {
  buddy_chat: 'openrouter_buddy_chat_success',
  practice_quiz: 'openrouter_practice_quiz_success',
  admin_quiz: 'openrouter_admin_quiz_success',
  thumbnail_keywords: 'openrouter_thumbnail_keywords_success',
};

const OR_ERROR_METRICS: Record<AITask, Parameters<typeof recordOpsMetric>[0]> = {
  buddy_chat: 'openrouter_buddy_chat_error',
  practice_quiz: 'openrouter_practice_quiz_error',
  admin_quiz: 'openrouter_admin_quiz_error',
  thumbnail_keywords: 'openrouter_thumbnail_keywords_error',
};

/**
 * Calls AI with automatic failover: Sarvam (primary) → Gemini → OpenRouter (multi-model fallback) → static_fallback.
 *
 * Returns `{ provider: 'static_fallback' }` when all cloud providers fail,
 * so callers can apply their own local domain fallback logic.
 */
export async function callAI(request: AIGatewayRequest): Promise<AIGatewayResponse> {
  const { task, messages, temperature = 0.3, max_tokens = 1000 } = request;
  const sarvamKey = process.env.SARVAM_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  // ── Step 1: Try Sarvam (Primary) ──────────────────────────────────────────

  const isInvalidSarvamKey = !sarvamKey || sarvamKey === 'your_sarvam_api_key_here' || sarvamKey.trim() === '';

  if (!isInvalidSarvamKey && sarvamKey) {
    const cbStatus = await checkCircuitBreaker();

    if (!cbStatus.isBroken) {
      try {
        const rawContent = await callSarvam(messages, temperature, max_tokens, sarvamKey);
        const content = stripReasoningBlocks(rawContent);
        await recordCircuitBreakerSuccess();
        return { 
          content, 
          provider: 'sarvam', 
          model: 'sarvam-30b',
          isReasoningStripped: rawContent !== content
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown Sarvam error';
        console.warn(`[AI Gateway] Sarvam failed for task="${task}": ${msg}`);
        
        if (msg.includes('AUTH_FAILURE')) {
          console.error(`[AI Gateway] CRITICAL: Sarvam API Key is INVALID. Switching to fallback.`);
        } else {
          await recordCircuitBreakerFailure(msg);
        }
      }
    } else {
      console.info(`[AI Gateway] Sarvam circuit breaker is OPEN — skipping to fallback for task="${task}"`);
    }
  }

  // ── Step 2: Try Gemini (Fast & Generous) ───────────────────────────────────

  if (geminiKey && geminiKey.trim() !== '') {
    try {
      console.info(`[AI Gateway] Trying Google Gemini 2.0 Flash for task="${task}"`);
      const rawContent = await callGemini(messages, temperature, max_tokens, geminiKey);
      const content = stripReasoningBlocks(rawContent);
      return {
        content,
        provider: 'gemini',
        model: 'gemini-2.0-flash',
        isReasoningStripped: rawContent !== content,
      };
    } catch (geminiError) {
      const msg = geminiError instanceof Error ? geminiError.message : 'Unknown';
      console.warn(`[AI Gateway] Gemini failed: ${msg}`);
    }
  }

  // ── Step 3: Try OpenRouter (Multi-model Fallback) ──────────────────────────

  if (openRouterKey && openRouterKey.trim() !== '') {
    for (const model of OPENROUTER_FALLBACK_MODELS) {
      try {
        console.info(`[AI Gateway] Trying OpenRouter model: ${model} for task="${task}"`);
        const rawContent = await callOpenRouter(messages, temperature, max_tokens, model, openRouterKey);
        const content = stripReasoningBlocks(rawContent);
        recordOpsMetric(OR_SUCCESS_METRICS[task]);
        return { 
          content, 
          provider: 'openrouter', 
          model,
          isReasoningStripped: rawContent !== content
        };
      } catch (orError) {
        const msg = orError instanceof Error ? orError.message : 'Unknown';
        console.warn(`[AI Gateway] OpenRouter model (${model}) failed: ${msg}`);
      }
    }
    recordOpsMetric(OR_ERROR_METRICS[task]);
  }

  // ── Step 4: All failed — return static_fallback signal ────────────────────

  console.warn(`[AI Gateway] All cloud providers failed for task="${task}" — returning static_fallback`);
  return { content: '', provider: 'static_fallback', model: 'none' };
}

