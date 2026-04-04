import { NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { getOpsSnapshot, recordOpsMetric } from '@/lib/server/opsTelemetry';

type HealthSnapshot = {
  ok: boolean;
  mongodb: {
    ok: boolean;
    latencyMs: number | null;
  };
  checkedAt: number;
};

const HEALTH_CACHE_TTL_MS = 5000;
let lastHealthSnapshot: HealthSnapshot | null = null;

export async function GET() {
  const startedAt = Date.now();
  recordOpsMetric('health_check');

  let mongoOk: boolean;
  let mongoLatencyMs: number | null;

  const now = Date.now();
  const cachedSnapshot = lastHealthSnapshot;
  const canUseCache =
    cachedSnapshot !== null &&
    now - cachedSnapshot.checkedAt <= HEALTH_CACHE_TTL_MS;

  if (canUseCache) {
    mongoOk = cachedSnapshot.mongodb.ok;
    mongoLatencyMs = cachedSnapshot.mongodb.latencyMs;
  } else {
    mongoOk = false;
    mongoLatencyMs = null;

    try {
      const mongoStart = Date.now();
      const db = await getMongoDb();
      await db.command({ ping: 1 });
      mongoOk = true;
      mongoLatencyMs = Date.now() - mongoStart;
    } catch {
      mongoOk = false;
    }

    lastHealthSnapshot = {
      ok: mongoOk,
      mongodb: {
        ok: mongoOk,
        latencyMs: mongoLatencyMs,
      },
      checkedAt: now,
    };
  }

  const sarvamConfigured = Boolean(process.env.SARVAM_API_KEY);
  const status = mongoOk ? 200 : 503;

  return NextResponse.json(
    {
      ok: mongoOk,
      service: 'karmasetu-web',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        mongodb: {
          ok: mongoOk,
          latencyMs: mongoLatencyMs,
        },
        sarvam: {
          configured: sarvamConfigured,
        },
      },
      telemetry: getOpsSnapshot(),
      responseTimeMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}