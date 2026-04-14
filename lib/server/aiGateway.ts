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
  provider: 'sarvam' | 'openrouter' | 'static_fallback';
  model: string;
}

// ─── Provider Config ─────────────────────────────────────────────────────────

const SARVAM_BASE_URL = 'https://api.sarvam.ai';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

/**
 * Task → Model mapping for OpenRouter fallback.
 * Each task has a primary and backup model.
 * All models use the `:free` suffix = $0.00 cost.
 */
const OPENROUTER_MODELS: Record<AITask, { primary: string; backup: string }> = {
  buddy_chat: {
    primary: 'meta-llama/llama-3.3-70b-instruct:free',
    backup: 'google/gemma-3-27b-it:free',
  },
  practice_quiz: {
    primary: 'meta-llama/llama-3.3-70b-instruct:free',
    backup: 'google/gemma-3-27b-it:free',
  },
  admin_quiz: {
    primary: 'meta-llama/llama-3.3-70b-instruct:free',
    backup: 'google/gemma-3-27b-it:free',
  },
  thumbnail_keywords: {
    primary: 'meta-llama/llama-3.3-70b-instruct:free',
    backup: 'google/gemma-3-27b-it:free',
  },
};

/**
 * Attempts to repair JSON that has been truncated due to token limits.
 * It will try common closing tags, and if that fails, drops the last incomplete object.
 */
export function repairTruncatedJson(jsonStr: string): string {
  let cleaned = jsonStr.trim();
  try { JSON.parse(cleaned); return cleaned; } catch (e) {}
  
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
    } catch {}
  }

  const lastBrace = cleaned.lastIndexOf('{');
  if (lastBrace > 0) {
    const attempt = cleaned.substring(0, lastBrace).replace(/,\s*$/, '') + ']';
    try {
      JSON.parse(attempt);
      return attempt;
    } catch {}
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
        model: 'sarvam-m',
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.message || errData?.error || `Sarvam HTTP ${response.status}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content || typeof content !== 'string') {
      throw new Error('Sarvam returned empty or invalid content');
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
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS + 5000); // slightly more generous

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://karmasetu.vercel.app',
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
 * Calls AI with automatic failover: Sarvam (primary) → OpenRouter (fallback) → static_fallback.
 *
 * Returns `{ provider: 'static_fallback' }` when both providers fail,
 * so callers can apply their own local static fallback logic.
 */
export async function callAI(request: AIGatewayRequest): Promise<AIGatewayResponse> {
  const { task, messages, temperature = 0.3, max_tokens = 1000 } = request;
  const sarvamKey = process.env.SARVAM_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  // ── Step 1: Try Sarvam (Primary) ──────────────────────────────────────────

  if (sarvamKey) {
    const cbStatus = await checkCircuitBreaker();

    if (!cbStatus.isBroken) {
      try {
        const content = await callSarvam(messages, temperature, max_tokens, sarvamKey);
        await recordCircuitBreakerSuccess();
        return { content, provider: 'sarvam', model: 'sarvam-m' };
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown Sarvam error';
        console.warn(`[AI Gateway] Sarvam failed for task="${task}": ${msg}`);
        await recordCircuitBreakerFailure(msg);
      }
    } else {
      console.info(`[AI Gateway] Sarvam circuit breaker is OPEN — skipping to OpenRouter for task="${task}"`);
    }
  }

  // ── Step 2: Try OpenRouter (Fallback) ─────────────────────────────────────

  if (openRouterKey) {
    const models = OPENROUTER_MODELS[task];

    // Try primary OpenRouter model
    try {
      console.info(`[AI Gateway] Trying OpenRouter primary model: ${models.primary} for task="${task}"`);
      const content = await callOpenRouter(messages, temperature, max_tokens, models.primary, openRouterKey);
      recordOpsMetric(OR_SUCCESS_METRICS[task]);
      return { content, provider: 'openrouter', model: models.primary };
    } catch (primaryError) {
      const msg = primaryError instanceof Error ? primaryError.message : 'Unknown';
      console.warn(`[AI Gateway] OpenRouter primary (${models.primary}) failed: ${msg}`);
    }

    // Try backup OpenRouter model
    try {
      console.info(`[AI Gateway] Trying OpenRouter backup model: ${models.backup} for task="${task}"`);
      const content = await callOpenRouter(messages, temperature, max_tokens, models.backup, openRouterKey);
      recordOpsMetric(OR_SUCCESS_METRICS[task]);
      return { content, provider: 'openrouter', model: models.backup };
    } catch (backupError) {
      const msg = backupError instanceof Error ? backupError.message : 'Unknown';
      console.warn(`[AI Gateway] OpenRouter backup (${models.backup}) also failed: ${msg}`);
      recordOpsMetric(OR_ERROR_METRICS[task]);
    }
  } else {
    console.info(`[AI Gateway] No OPENROUTER_API_KEY set — skipping fallback for task="${task}"`);
  }

  // ── Step 3: Both failed — return static_fallback signal ───────────────────

  console.warn(`[AI Gateway] All providers failed for task="${task}" — returning static_fallback`);
  return { content: '', provider: 'static_fallback', model: 'none' };
}

