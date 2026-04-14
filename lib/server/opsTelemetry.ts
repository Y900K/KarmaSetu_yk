type OpsMetricKey =
  | 'sarvam_chat_timeout'
  | 'sarvam_chat_fallback'
  | 'sarvam_chat_error'
  | 'sarvam_tts_timeout'
  | 'sarvam_tts_error'
  | 'sarvam_asr_timeout'
  | 'sarvam_asr_error'
  | 'openrouter_buddy_chat_success'
  | 'openrouter_buddy_chat_error'
  | 'openrouter_practice_quiz_success'
  | 'openrouter_practice_quiz_error'
  | 'openrouter_admin_quiz_success'
  | 'openrouter_admin_quiz_error'
  | 'openrouter_thumbnail_keywords_success'
  | 'openrouter_thumbnail_keywords_error'
  | 'health_check';

type OpsMetricsStore = {
  startedAt: number;
  counters: Record<OpsMetricKey, number>;
};

declare global {
  var _opsMetricsStore: OpsMetricsStore | undefined;
}

function createStore(): OpsMetricsStore {
  return {
    startedAt: Date.now(),
    counters: {
      sarvam_chat_timeout: 0,
      sarvam_chat_fallback: 0,
      sarvam_chat_error: 0,
      sarvam_tts_timeout: 0,
      sarvam_tts_error: 0,
      sarvam_asr_timeout: 0,
      sarvam_asr_error: 0,
      openrouter_buddy_chat_success: 0,
      openrouter_buddy_chat_error: 0,
      openrouter_practice_quiz_success: 0,
      openrouter_practice_quiz_error: 0,
      openrouter_admin_quiz_success: 0,
      openrouter_admin_quiz_error: 0,
      openrouter_thumbnail_keywords_success: 0,
      openrouter_thumbnail_keywords_error: 0,
      health_check: 0,
    },
  };
}

function getStore(): OpsMetricsStore {
  if (!global._opsMetricsStore) {
    global._opsMetricsStore = createStore();
  }

  return global._opsMetricsStore;
}

export function recordOpsMetric(metric: OpsMetricKey) {
  const store = getStore();
  store.counters[metric] += 1;
}

export function getOpsSnapshot() {
  const store = getStore();
  return {
    startedAt: new Date(store.startedAt).toISOString(),
    uptimeMs: Date.now() - store.startedAt,
    counters: { ...store.counters },
  };
}
