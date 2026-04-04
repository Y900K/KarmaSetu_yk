import type { Db } from 'mongodb';
import { COLLECTIONS } from '@/lib/db/collections';

const FAILED_WINDOW_MS = 30 * 60 * 1000;
const FAILURE_THRESHOLD = 5;
const DISTINCT_IP_THRESHOLD = 3;
const DEDUPE_WINDOW_MS = 6 * 60 * 60 * 1000;

export async function maybeRaiseMultiIpFailedLoginAlert(db: Db, identifier: string) {
  const since = new Date(Date.now() - FAILED_WINDOW_MS);

  const recentFailures = await db
    .collection(COLLECTIONS.authAudit)
    .find({
      action: 'login_failed',
      identifier,
      createdAt: { $gte: since },
    })
    .project({ ip: 1 })
    .toArray();

  const distinctIps = new Set(
    recentFailures
      .map((entry) => (typeof entry.ip === 'string' ? entry.ip : 'unknown'))
      .filter((ip) => ip !== 'unknown')
  );

  if (recentFailures.length < FAILURE_THRESHOLD || distinctIps.size < DISTINCT_IP_THRESHOLD) {
    return false;
  }

  const dedupeSince = new Date(Date.now() - DEDUPE_WINDOW_MS);
  const existing = await db.collection(COLLECTIONS.adminNotifications).findOne({
    category: 'security',
    status: 'open',
    createdAt: { $gte: dedupeSince },
    'metadata.rule': 'multi_ip_failed_login',
    'metadata.identifier': identifier,
  });

  if (existing) {
    return false;
  }

  await db.collection(COLLECTIONS.adminNotifications).insertOne({
    category: 'security',
    level: 'HIGH',
    title: 'Suspicious multi-IP login failures detected',
    desc: `${identifier} had ${recentFailures.length} failed login attempts from ${distinctIps.size} IPs in the last 30 minutes.`,
    action: 'Review Auth Audit',
    status: 'open',
    createdAt: new Date(),
    metadata: {
      rule: 'multi_ip_failed_login',
      identifier,
      failureCount: recentFailures.length,
      distinctIpCount: distinctIps.size,
      sampleIps: Array.from(distinctIps).slice(0, 5),
      windowMinutes: 30,
    },
  });

  return true;
}
