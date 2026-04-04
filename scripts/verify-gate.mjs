import { spawn } from 'node:child_process';

const BASE_URL = process.env.SMOKE_BASE_URL || 'http://localhost:3000';
const REQUIRE_DB_OK = process.env.VERIFY_REQUIRE_DB_OK === 'true';
const REQUIRE_SARVAM = process.env.VERIFY_REQUIRE_SARVAM === 'true';
const HEALTH_RESPONSE_MAX_MS = Number.parseInt(process.env.HEALTH_RESPONSE_MAX_MS || '3000', 10);
const MONGO_LATENCY_MAX_MS = Number.parseInt(process.env.MONGO_LATENCY_MAX_MS || '5000', 10);

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      env: process.env,
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(' ')} exited with ${code}`));
    });
  });
}

async function checkHealth() {
  const response = await fetch(`${BASE_URL}/api/health`);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok && response.status !== 503) {
    throw new Error(`Health endpoint failed with status ${response.status}`);
  }

  const responseTimeMs = typeof payload?.responseTimeMs === 'number' ? payload.responseTimeMs : null;
  const mongoOk = payload?.checks?.mongodb?.ok === true;
  const mongoLatencyMs = typeof payload?.checks?.mongodb?.latencyMs === 'number' ? payload.checks.mongodb.latencyMs : null;
  const sarvamConfigured = payload?.checks?.sarvam?.configured === true;

  if (responseTimeMs !== null && responseTimeMs > HEALTH_RESPONSE_MAX_MS) {
    throw new Error(`Health response time too high: ${responseTimeMs}ms (limit ${HEALTH_RESPONSE_MAX_MS}ms)`);
  }

  if (REQUIRE_DB_OK && !mongoOk) {
    throw new Error('MongoDB health check is not OK while VERIFY_REQUIRE_DB_OK=true');
  }

  if (mongoLatencyMs !== null && mongoLatencyMs > MONGO_LATENCY_MAX_MS) {
    throw new Error(`MongoDB latency too high: ${mongoLatencyMs}ms (limit ${MONGO_LATENCY_MAX_MS}ms)`);
  }

  if (REQUIRE_SARVAM && !sarvamConfigured) {
    throw new Error('Sarvam is not configured while VERIFY_REQUIRE_SARVAM=true');
  }

  console.log('Health gate passed:', {
    status: response.status,
    responseTimeMs,
    mongoOk,
    mongoLatencyMs,
    sarvamConfigured,
  });
}

async function run() {
  const isWin = process.platform === 'win32';
  const npmCmd = isWin ? 'cmd.exe' : 'npm';
  const npmArgs = isWin ? ['/c', 'npm', 'run', 'verify:smoke'] : ['run', 'verify:smoke'];

  console.log('Running smoke checks...');
  await runCommand(npmCmd, npmArgs);

  console.log('Running health gate...');
  await checkHealth();

  console.log('Verification gate passed.');
}

run().catch((error) => {
  console.error('Verification gate failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
